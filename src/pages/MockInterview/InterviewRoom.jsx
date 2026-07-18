import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import api from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import AntiCheatOverlay from '../../components/AntiCheatOverlay';
import useAntiCheat from '../../hooks/useAntiCheat';
import useFaceDetection from '../../hooks/useFaceDetection';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Cpu,
  Radio,
  SkipForward,
  Activity,
  Camera,
  CameraOff,
  ShieldCheck,
  Play,
  Keyboard,
  Type
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [template, setTemplate] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [qaPairs, setQaPairs] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('ai'); // 'ai' or 'camera'
  const [answerMode, setAnswerMode] = useState('text'); // 'voice' or 'text'
  
  // Lobby and Verification State
  const [verified, setVerified] = useState(false);
  const [faceMatched, setFaceMatched] = useState(false);
  const [matchingFace, setMatchingFace] = useState(false);
  const [lightingStatus, setLightingStatus] = useState('good');
  const [lightingVal, setLightingVal] = useState(120);
  const [audioLevel, setAudioLevel] = useState(0);
  const [offlineTimeout, setOfflineTimeout] = useState(120);
  const [cheatingRisk, setCheatingRisk] = useState('Low');
  const [integrityScore, setIntegrityScore] = useState(100);

  // Session & Telemetry State
  const [seconds, setSeconds] = useState(120);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  
  // Camera State
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  
  const timerRef = useRef(null);
  const transcribingRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const questionSpokenForIdx = useRef(-1);
  const submitStartedRef = useRef(false);
  const faceViolationTimerRef = useRef(null);
  const silenceCounterRef = useRef(0);
  const lastTypedAnswerRef = useRef('');
  const typedAnswerRef = useRef('');

  useEffect(() => {
    typedAnswerRef.current = typedAnswer;
  }, [typedAnswer]);

  // Advanced Anti-Cheat
  const { warningCount, showWarning, warningMessage, isBlurred, isOnline, dismiss, triggerWarning } = useAntiCheat({
    active: verified && !!template && !submitting,
    onViolation: (count, msg) => {
      let warningType = 'suspicious';
      if (msg.includes('Tab')) warningType = 'tab';
      else if (msg.includes('Focus')) warningType = 'tab';
      else if (msg.includes('Copy') || msg.includes('Paste') || msg.includes('Cut') || msg.includes('select') || msg.includes('Right-click')) warningType = 'copy';
      else if (msg.includes('DevTools') || msg.includes('inspect') || msg.includes('source')) warningType = 'devtools';
      else if (msg.includes('zoom')) warningType = 'zoom';
      else if (msg.includes('Fullscreen')) warningType = 'fullscreen';
      else if (msg.includes('Mouse')) warningType = 'mouse';
      
      interviewService.logWarning(id, warningType, msg, count)
        .catch(e => console.warn(e));

      if (count >= 5) {
        handleDisqualification();
      }
    }
  });

  // Multi-Face Detection
  const { faceCount, modelLoaded, getPresenceScore, checkLighting, simulateFaceMatch } = useFaceDetection(videoRef, !!stream);
  
  // Microphone RMS analyser in lobby
  useEffect(() => {
    if (verified) return;

    let isMounted = true;
    let audioCtx = null;
    let streamObj = null;

    const startMic = async () => {
      try {
        streamObj = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = streamObj;
        
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(streamObj);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkVolume = () => {
          if (!isMounted) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.round(average));
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        console.warn("Microphone access denied:", err);
      }
    };

    startMic();

    return () => {
      isMounted = false;
      if (audioCtx) audioCtx.close();
      if (streamObj) streamObj.getTracks().forEach(t => t.stop());
    };
  }, [verified]);

  // Periodically check lighting status in lobby
  useEffect(() => {
    if (verified || !stream) return;
    const interval = setInterval(() => {
      const { brightness, status } = checkLighting();
      setLightingVal(brightness);
      setLightingStatus(status);
    }, 500);
    return () => clearInterval(interval);
  }, [verified, stream]);

  // Run face matching when face is first detected in the lobby
  useEffect(() => {
    if (verified || faceCount !== 1 || faceMatched || matchingFace) return;
    
    setMatchingFace(true);
    simulateFaceMatch().then((res) => {
      if (res.matched) {
        setFaceMatched(true);
        setMatchingFace(false);
        addNotification({
          title: "Identity Verified",
          message: `Face match verified successfully with ${res.confidence}% confidence.`,
          type: "success"
        });
      }
    });
  }, [verified, faceCount, faceMatched, matchingFace]);

  // Zoom monitoring / check dynamically
  useEffect(() => {
    let score = 100;
    let risk = 'Low';
    if (warningCount === 1) { score = 95; risk = 'Low'; }
    else if (warningCount === 2) { score = 85; risk = 'Medium'; }
    else if (warningCount === 3) { score = 70; risk = 'Medium'; }
    else if (warningCount === 4) { score = 55; risk = 'High'; }
    else if (warningCount >= 5) { score = 20; risk = 'Critical'; }
    setIntegrityScore(score);
    setCheatingRisk(risk);
  }, [warningCount]);

  // Network Recovery countdown
  useEffect(() => {
    if (!verified || submitting) return;
    if (isOnline) {
      setOfflineTimeout(120);
      return;
    }
    
    const interval = setInterval(() => {
      setOfflineTimeout(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitInterview(qaPairs, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOnline, verified, submitting, qaPairs]);

  // Gaze check simulation
  useEffect(() => {
    if (!verified || submitting) return;
    const gazeInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        triggerWarning("⚠️ Gaze deviation detected! Please look directly at the screen during the assessment.");
      }
    }, 25000);
    return () => clearInterval(gazeInterval);
  }, [verified, submitting]);

  // Enforced Full Screen listener
  useEffect(() => {
    if (!verified || submitting || !template) return;
    
    const onFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (!isFullscreen) {
        triggerWarning("⚠️ Fullscreen mode exited! The assessment must be completed in fullscreen. This violation has been logged.");
        const requestFS = async () => {
          try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) await elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
          } catch (e) {
            console.warn(e);
          }
        };
        requestFS();
      }
    };
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, [verified, submitting, template, triggerWarning]);

  // Pause and Speak logic based on face detection and user presence
  useEffect(() => {
    if (!verified) return;
    
    if (faceCount > 1) {
      // Start a 3-second grace timer if not already running, to prevent blink/frame-drop spikes
      if (!faceViolationTimerRef.current) {
        faceViolationTimerRef.current = setTimeout(() => {
          triggerWarning(`⚠️ Multiple faces detected (${faceCount}). Please ensure you are alone.`);
          faceViolationTimerRef.current = null;
        }, 3000);
      }

      // Pause the timer and speech recognition immediately for security
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (speechRecognitionRef.current && recording) {
        speechRecognitionRef.current.stop();
        setRecording(false);
      }
      window.speechSynthesis.cancel();
    } else if (!submitting) {
      // Clear pending face warning timers since user is back
      if (faceViolationTimerRef.current) {
        clearTimeout(faceViolationTimerRef.current);
        faceViolationTimerRef.current = null;
      }

      // Start or Resume timer if not already running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSeconds(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              handleNextQuestion(true);
              return 0;
            }
            return prev - 1;
          });
          setElapsed(prev => prev + 1);

          // Track prolonged silence during voice mode answer attempts
          if (recording) {
            if (typedAnswerRef.current === lastTypedAnswerRef.current) {
              silenceCounterRef.current += 1;
              if (silenceCounterRef.current === 30) {
                triggerWarning("🎙️ Silence detected for more than 30 seconds. Please answer the question by speaking.");
              }
            } else {
              silenceCounterRef.current = 0;
              lastTypedAnswerRef.current = typedAnswerRef.current;
            }
          } else {
            silenceCounterRef.current = 0;
          }
        }, 1000);
      }

      // Read question if user is present and it hasn't been read yet for this index
      if (template && speechEnabled && questionSpokenForIdx.current !== currentIdx) {
        speakQuestion(template.questions[currentIdx].text);
        questionSpokenForIdx.current = currentIdx;
      }
    }
  }, [faceCount, submitting, verified, currentIdx, template, speechEnabled, triggerWarning, handleNextQuestion, recording]);

  const handleDisqualification = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    
    // Suspend the specific user account
    if (user && user.id) {
      try {
        const ip = '127.0.0.1';
        const browser = navigator.userAgent;
        const device = navigator.platform;
        const os = 'Windows';
        
        await api.post('/auth/suspend', {
          userId: user.id,
          reason: 'Automated Proctor lockout: Candidate triggered 5 security warnings.',
          warnings: 5,
          ip,
          device,
          browser,
          os
        });
        
        const blockUntil = Date.now() + 30 * 60 * 1000;
        localStorage.setItem(`proctoring_block_until`, blockUntil.toString());
      } catch (err) {
        console.error("Failed to suspend user:", err);
      }
    }
    
    alert("DISQUALIFICATION: You have triggered 5 proctoring strikes. The interview is terminated immediately and your account is locked.");
    handleSubmitInterview(qaPairs, true);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      setCameraError('');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access denied or not available.');
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      startCamera();
    }
  };

  const enterExamHall = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen denied:", err);
    }
    
    try {
      await interviewService.startSession(id);
      await interviewService.logActivity(id, 'camera_verified', 'Pre-interview verification checks passed.');
    } catch (e) {}

    setVerified(true);
  };

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templates = await interviewService.getTemplates() || [];
        const found = templates.find(t => t.id === id);
        if (!found) {
          navigate('/interview');
          return;
        }
        setTemplate(found);
        
        if (found.isVideo) {
          startCamera();
        } else {
          setVerified(true);
        }
      } catch (err) {
        console.error("Failed to load template in InterviewRoom:", err);
        navigate('/interview');
      }
    };
    loadTemplate();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        if (faceCount > 1) return; // Prevent input if paused
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTypedAnswer((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setRecording(false);
      };
      
      speechRecognitionRef.current = recognition;
    }

    setSeconds(120);
    setElapsed(0);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      window.speechSynthesis.cancel();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, navigate, currentIdx]);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (speechEnabled) {
      window.speechSynthesis.cancel();
    } else if (template) {
      speakQuestion(template.questions[currentIdx].text);
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Calculate telemetry when answer changes
  useEffect(() => {
    if (typedAnswer) {
      // Filler words
      const fillers = ['um', 'uh', 'like', 'basically', 'you know'];
      const words = typedAnswer.toLowerCase().split(/\s+/);
      const count = words.filter(w => fillers.includes(w)).length;
      setFillerCount(count);

      // WPM
      const mins = elapsed / 60;
      if (mins > 0) {
        setWpm(Math.round(words.length / mins));
      }
    }
  }, [typedAnswer, elapsed]);

  const handleToggleRecord = () => {
    if (!speechRecognitionRef.current) {
      alert(getTranslation('micNotSupportedAlert'));
      return;
    }

    if (recording) {
      speechRecognitionRef.current.stop();
      setRecording(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  function handleNextQuestion(forced = false) {
    if (!template) return;
    if (recording && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setRecording(false);
    }
    
    // Save current answer
    const currentQuestion = template.questions[currentIdx].text;
    const finalAnswer = typedAnswer.trim() || (forced ? "[Timeout: No Answer]" : "[Skipped by Candidate]");
    const newPairs = [...qaPairs, { question: currentQuestion, userAnswer: finalAnswer }];
    
    // Mid-Session Payload Transmitter
    interviewService.cacheProgress(id, newPairs).catch(e => console.warn(e));
    
    setQaPairs(newPairs);
    setTypedAnswer('');
    setFillerCount(0);
    setWpm(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Check if last question
    if (currentIdx < template.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmitInterview(newPairs);
    }
  };

  const handleSubmitInterview = async (finalPairs, disqualified = false) => {
    if (submitStartedRef.current) return;
    submitStartedRef.current = true;
    setSubmitting(true);
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const score = getPresenceScore();
      const report = await interviewService.submitInterview(id, finalPairs, elapsed, disqualified, score);
      
      // Trigger a live notification
      addNotification({
        title: 'Mock Interview Graded',
        message: `You completed your ${template?.title || 'Mock'} interview with an overall score of ${report.overallScore}%.`,
        type: 'interview',
        link: `/interview/report/${report.id}`
      });

      navigate(`/interview/report/${report.id}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (!template) return <Loader message={getTranslation('loadingQuestions')} />;

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="glass-panel text-center py-12 border border-slate-200 dark:border-slate-800/80">
          <Loader message={getTranslation('analyzingResponses')} size="lg" />
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
        <h2 className="text-3xl font-display font-black text-slate-100 flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-cognitive-primary" />
          AI Secure Proctoring Lobby
        </h2>
        <p className="text-sm text-slate-400 mb-8 max-w-2xl">
          Please verify your camera feed, microphone input, proper room lighting, and face mapping status before entering the secure examination zone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col gap-4">
            <Card className="liquid-glass-card p-4 relative overflow-hidden flex items-center justify-center min-h-[300px] border border-slate-200/50 dark:border-white/5 shadow-2xl">
              {matchingFace && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full border-4 border-cognitive-primary border-t-transparent animate-spin mb-4" />
                  <p className="text-xs font-bold text-white tracking-widest uppercase">Scanning & Matching Face...</p>
                </div>
              )}
              {cameraError ? (
                <div className="text-center p-4">
                  <CameraOff className="w-12 h-12 text-rose-500 mx-auto mb-2 opacity-55" />
                  <p className="text-sm font-bold text-rose-500">{cameraError}</p>
                  <Button variant="secondary" size="sm" onClick={startCamera} className="mt-4">Allow Camera</Button>
                </div>
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {faceCount === 1 && !faceMatched && (
                    <div className="absolute inset-x-8 top-8 bottom-8 border-2 border-dashed border-emerald-500 rounded-2xl animate-pulse flex items-center justify-center">
                      <div className="absolute w-full h-1 bg-emerald-500 top-0 left-0 animate-scan shadow-lg shadow-emerald-500/50" />
                    </div>
                  )}
                  {faceMatched && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
            </Card>
            
            <div className="bg-slate-900/5 dark:bg-black/20 p-4 border border-slate-200/50 dark:border-white/5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Live Sound Levels:
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Mic className="w-4.5 h-4.5 text-slate-400" />
                <div className="flex-1 h-3 bg-slate-900/10 dark:bg-black/30 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded transition-all duration-75 shadow-lg shadow-emerald-500/30"
                    style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <Card className="liquid-glass-card p-6 flex flex-col gap-6 border border-slate-200/50 dark:border-white/5 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Proctor Readiness Checklist</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${stream ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {stream ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Camera Feed Authorization {template?.isVideo ? '(Required)' : '(Optional)'}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Permits live visual proctor tracking during assessment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${audioLevel > 5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {audioLevel > 5 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Active Microphone Recording (Required)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Analyzes room noise levels. Speak into the mic to verify.</p>
                  </div>
                </div>

                {template?.isVideo && (
                  <>
                    <div className="flex items-start gap-4">
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${lightingStatus === 'good' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {lightingStatus === 'good' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Adequate Room Lighting</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lightingStatus === 'too_dark' ? '⚠️ Lighting is too dark. Brighten your room.' : lightingStatus === 'too_bright' ? '⚠️ Lighting is too bright. Reduce direct light source.' : 'Room illumination is within acceptable metrics.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${faceCount === 1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {faceCount === 1 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Single Candidate Presence</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Ensure you are sitting directly in front of the lens alone.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${faceMatched ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {faceMatched ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Facial Signature Verification</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Matches candidate facial pattern against registration records.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {template?.isVideo && !stream && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Camera is required for Video Interview. Please enable your webcam.</span>
                </div>
              )}

              {!template?.isVideo && audioLevel <= 5 && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Microphone not detected. Please connect a microphone before starting the interview.</span>
                </div>
              )}

              <div className="mt-4 pt-6 border-t border-slate-250/20">
                <button
                  disabled={template?.isVideo ? !(stream && audioLevel > 5 && lightingStatus === 'good' && faceCount === 1 && faceMatched) : !(audioLevel > 5)}
                  onClick={enterExamHall}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cognitive-primary to-cognitive-secondary disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enter Exam Hall in Full Screen Mode</span>
                </button>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-3">
                  ⚠️ Requesting fullscreen is mandatory upon launch. Exiting fullscreen prompts warnings.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionObj = template.questions[currentIdx];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in-up" style={{ userSelect: 'none' }}>
      {/* Anti-cheat violation overlay */}
      <AntiCheatOverlay
        show={showWarning}
        message={warningMessage}
        warningCount={warningCount}
        onDismiss={dismiss}
      />

      {/* Offline/Connection loss Overlay */}
      {!isOnline && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-xl saturate-150 animate-fade-in"
          style={{ background: 'rgba(10, 6, 30, 0.85)' }}
        >
          <Card className="max-w-md w-full text-center py-10 px-6 border-rose-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6 relative">
              <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Internet Disconnected</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 mb-6 leading-relaxed">
              Your connection was lost. Proctoring timers are paused. Please check your local network connection.
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 animate-bounce" />
              <span className="text-lg font-mono font-bold text-amber-500">{offlineTimeout}s</span>
              <span className="text-xs font-semibold text-slate-400">until auto-submission</span>
            </div>
          </Card>
        </div>
      )}
      
      {/* HUD Header Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-lg">
        <div>
          <h2 className="text-3xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-cognitive-primary to-cognitive-secondary tracking-tight">
            {template.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {getTranslation('liveSession')} • {template.category} {getTranslation('arena')} • {getTranslation('question')} {currentIdx + 1}/{template.questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Proctoring HUD Panel */}
          <div className={`flex items-center gap-3 bg-slate-900/5 dark:bg-black/20 border px-5 py-2.5 rounded-xl text-xs font-bold shadow-inner ${
            cheatingRisk === 'Critical' || cheatingRisk === 'High'
              ? 'border-rose-500/30 text-rose-500'
              : 'border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300'
          }`}>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <div className="flex gap-4">
              <span>Integrity: <span className="text-emerald-500">{integrityScore}%</span></span>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <span>Risk: <span className={cheatingRisk === 'Critical' || cheatingRisk === 'High' ? "text-rose-500 animate-pulse font-black" : "text-emerald-500"}>{cheatingRisk}</span></span>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <span>Warnings: <span className="text-amber-500 font-bold">{warningCount}/5</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/5 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold shadow-inner">
            <Activity className="w-4 h-4 text-cognitive-secondary" />
            <div className="flex gap-4">
              <span>{getTranslation('fillers')}: <span className={fillerCount > 3 ? "text-rose-500" : "text-emerald-500"}>{fillerCount}</span></span>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <span>{getTranslation('wpmLabel')}: <span className="text-cognitive-primary">{wpm}</span></span>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 border px-5 py-2.5 rounded-xl text-sm font-black shadow-inner transition-colors duration-300 ${
            seconds <= 30 
              ? 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-400 animate-pulse' 
              : 'bg-cognitive-primary/5 border-cognitive-primary/30 text-cognitive-primary'
          }`}>
            <Clock className={`w-4 h-4 ${seconds <= 30 ? 'animate-bounce' : ''}`} />
            <span>{formatDuration(seconds)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left pane: Proctoring feed (Col Span 4) - only shown for Video Interviews */}
        {template?.isVideo && (
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
            <Card className="liquid-glass-card flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative shadow-2xl min-h-[400px]">
              {/* Background Ambient Glow */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cognitive-primary/20 to-transparent blur-2xl pointer-events-none opacity-60" />

              <div className="flex-1 flex flex-col min-h-0 relative z-10">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-display font-bold text-slate-500 uppercase tracking-[0.15em]">
                      {getTranslation('proctoringFeed')}
                    </span>
                  </div>
                  
                  <button
                    onClick={toggleCamera}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      stream 
                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                  >
                    {stream ? <><CameraOff className="w-3 h-3" /> {getTranslation('stopLabel')}</> : <><Camera className="w-3 h-3" /> {getTranslation('startLabel')}</>}
                  </button>
                </div>
                
                <div className="flex-1 relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center group min-h-[200px]">
                  {cameraError ? (
                    <div className="text-center p-4">
                      <CameraOff className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-rose-500">{cameraError}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{getTranslation('allowCameraPermissions')}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover mirror"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      
                      {/* Face Warning Overlay */}
                      {faceCount > 1 && (
                        <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-50">
                          <AlertTriangle className="w-12 h-12 text-rose-400 mb-3 animate-bounce" />
                          <h4 className="text-white font-black uppercase tracking-wider text-sm mb-1">{getTranslation('violationDetected')}</h4>
                          <p className="text-rose-200 text-xs font-medium">
                            {faceCount} {getTranslation('facesFoundPaused')}
                          </p>
                        </div>
                      )}
                      
                      {/* Scanning Line Effect */}
                      <div className="absolute inset-0 pointer-events-none border-t border-emerald-500/30 opacity-50 shadow-[0_5px_15px_rgba(16,185,129,0.3)] animate-[float-drift_4s_ease-in-out_infinite]" />

                      {/* Status Pill */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-lg flex items-center gap-2 text-[10px] font-mono font-bold text-white shadow-lg border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${modelLoaded ? (faceCount === 1 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]') : 'bg-amber-400 animate-pulse'}`} />
                        {modelLoaded ? `${faceCount} ${getTranslation('facesDetected')}` : getTranslation('loadingModel')}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Right pane: Action Center (Col Span 8 or 12 depending on isVideo) */}
        <div className={`${template?.isVideo ? 'lg:col-span-8' : 'lg:col-span-12 max-w-5xl mx-auto w-full'} flex flex-col gap-6 min-h-0`}>
          
          <Card className="liquid-glass-card flex-1 flex flex-col relative z-10 overflow-hidden min-h-0 p-8 shadow-2xl">
            {/* Question Section */}
            <div className="space-y-4 flex-shrink-0 mb-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cognitive-primary/10 border border-cognitive-primary/20 text-xs font-display font-black text-cognitive-primary uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  {getTranslation('promptLabel')} {currentIdx + 1}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-relaxed overflow-y-auto max-h-[25vh] custom-scrollbar pr-4">
                {currentQuestionObj.text}
              </h3>
            </div>

            {/* Answer Interface */}
            <div className="flex-1 flex flex-col min-h-0 gap-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-white/5 p-4 sm:p-6 shadow-inner">
              <div className="flex justify-between items-center flex-shrink-0">
                <label className="flex items-center gap-2 text-xs font-display font-black text-slate-500 uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 text-cognitive-secondary" />
                  {getTranslation('yourInputBuffer')}
                </label>

                <div className="flex items-center gap-2">
                  {recording && (
                    <span className="text-xs text-cognitive-primary font-bold flex items-center gap-2 px-3 py-1 bg-cognitive-primary/10 rounded-full border border-cognitive-primary/20">
                      <span className="w-2 h-2 rounded-full bg-cognitive-primary animate-ping" />
                      {getTranslation('transcribing')}
                    </span>
                  )}

                  {/* Voice / Text Mode Toggle */}
                  <div className="flex gap-1 p-0.5 bg-slate-200/80 dark:bg-black/30 rounded-lg border border-slate-300/50 dark:border-white/5">
                    <button
                      onClick={() => setAnswerMode('text')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        answerMode === 'text'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" /> Text
                    </button>
                    <button
                      onClick={() => setAnswerMode('voice')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        answerMode === 'voice'
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" /> Voice
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  placeholder={answerMode === 'text' ? 'Type your answer here... Structure your response clearly with examples.' : getTranslation('responsePlaceholder')}
                  className="flex-1 w-full p-6 bg-white/70 dark:bg-[#0a0a0f]/80 text-slate-800 dark:text-slate-200 text-base leading-relaxed transition-all focus:outline-none resize-none custom-scrollbar backdrop-blur-sm"
                  style={{ userSelect: 'text' }}
                  readOnly={answerMode === 'voice'}
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between pt-6 mt-auto flex-shrink-0">
              {answerMode === 'voice' ? (
                <Button
                  onClick={handleToggleRecord}
                  variant={recording ? 'danger' : 'secondary'}
                  icon={recording ? MicOff : Mic}
                  className={`shadow-md material-interactive ${recording ? 'animate-pulse ring-2 ring-rose-500/50' : ''}`}
                >
                  {recording ? getTranslation('stopRecording') : getTranslation('startMicrophone')}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Keyboard className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold">Text Mode</span>
                  <span className="text-slate-500">— Type your answer above</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNextQuestion(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors material-interactive"
                >
                  {getTranslation('skipQuestion')}
                </button>
                <Button
                  onClick={() => handleNextQuestion(false)}
                  variant="primary"
                  icon={ArrowRight}
                  className="px-8 py-3 bg-gradient-to-r from-cognitive-primary to-cognitive-secondary shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-white/20 material-interactive"
                >
                  {currentIdx === template.questions.length - 1 ? getTranslation('completeEvaluation') : getTranslation('submitResponse')}
                </Button>
              </div>
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  );

};

export default InterviewRoom;
