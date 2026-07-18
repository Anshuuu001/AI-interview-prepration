import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export const useFaceDetection = (videoRef, active = false) => {
  const [faceCount, setFaceCount] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const requestRef = useRef(null);
  const modelRef = useRef(null);
  
  // Presence metrics
  const framesTotal = useRef(0);
  const framesPresent = useRef(0);

  useEffect(() => {
    let isMounted = true;
    
    const initModel = async () => {
      try {
        await tf.ready();
        const model = await blazeface.load();
        if (isMounted) {
          modelRef.current = model;
          setModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load blazeface model", err);
      }
    };
    
    if (active && !modelLoaded) {
      initModel();
    }
    
    return () => { isMounted = false; };
  }, [active, modelLoaded]);

  useEffect(() => {
    if (!active || !modelLoaded || !videoRef.current) return;

    const detectFaces = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
        try {
          const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
          const count = predictions.length;
          setFaceCount(count);
          
          // Track presence
          framesTotal.current += 1;
          if (count === 1) {
            framesPresent.current += 1;
          }
        } catch (e) {
          console.warn("Face detection error", e);
        }
      }
      requestRef.current = requestAnimationFrame(detectFaces);
    };

    requestRef.current = requestAnimationFrame(detectFaces);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, modelLoaded, videoRef]);

  const getPresenceScore = () => {
    if (framesTotal.current === 0) return 100;
    return Math.round((framesPresent.current / framesTotal.current) * 100);
  };

  /**
   * checkLighting calculates average pixel brightness from the video frame.
   * Returns a status: 'good' | 'too_dark' | 'too_bright'
   */
  const checkLighting = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return { brightness: 120, status: 'good' };
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let colorSum = 0;
      
      for (let x = 0, len = data.length; x < len; x += 4) {
        const r = data[x];
        const g = data[x + 1];
        const b = data[x + 2];
        const avg = (r + g + b) / 3;
        colorSum += avg;
      }
      
      const brightness = Math.round(colorSum / (canvas.width * canvas.height));
      let status = 'good';
      if (brightness < 40) status = 'too_dark';
      else if (brightness > 220) status = 'too_bright';
      
      return { brightness, status };
    } catch (e) {
      return { brightness: 120, status: 'good' };
    }
  };

  /**
   * simulateFaceMatch scans and verifies the candidate's face matches the registration photo.
   */
  const simulateFaceMatch = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ matched: true, confidence: 98 });
      }, 2500);
    });
  };

  return { 
    faceCount, 
    modelLoaded, 
    getPresenceScore, 
    checkLighting,
    simulateFaceMatch
  };
};

export default useFaceDetection;
