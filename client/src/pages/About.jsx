import "./About.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiPlay,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

import Navbar from "../components/layout/Navbar";

import lilyVideo from "../assets/videos/lily-bloom.mp4";
import aboutMusic from "../assets/audio/pomona-about.mp3";

const timelineItems = [
  {
    id: 1,
    question: "Who am I?",
    answer:
      "Hey I am sampark, a 19year old developer from India and i love to exaggerate my silly  little ideas, Pomona is my first proper project that i finished completely and is now live, It took a lot of time but i am just really happy that it is now completed! I just really like when my tech has some personality   ",
  },
  {
    id: 2,
    question: "Why do i built pomona?",
    answer:
      "Tbh I really have no Idea , if I am being real i was just kinda depressed and was wondering what happend to all that potential, so in order to just prove myself I built pomona  ",
  },
  {
    id: 3,
    question: "So What is Pomona?",
    answer:
      "A visual encyclopedia for fruits — their origins, biology, culture, strange details, and everything in between , The name pomona is actually refers to greek goddess known as pomona - Goddess of fruits ",
  },
  {
    id: 4,
    question: "Why make it beautiful?",
    answer:
      "Because I don't wanted pomona to feel like reading a database. Curiosity deserves an atmosphere that's why I have put all of my lifetime learnings , hardwork and braincells into creating this",
  },
  {
    id: 5,
    question: "What to convey?",
    answer:
      "Fruits are really ordinary enough to go unnoticed , but they are something that have existed way before us , They are very similar to those little things that are so simple to just go unnoticed but are actually what makes our life worth living :)    ",
  },
  {
    id: 6,
    question: "What are we really exploring?",
    answer:
      "Not just fruits, but all those tiny details that make ordinary things feels like extraordinary because it was never actually about ignoring the ordinary but was more about exploring it. ",
  },
  {
    id: 7,
    question: "Was it ever really about fruits?",
    answer:
      "Probably not. Fruits were just where I decided to start. Somewhere along the way, it became less about collecting facts and more about learning how to look at things again. To slow down, staring at a weird fruit named 'peanut butter' or sometimes spend an unreasonable amount of time making something nobody really asked for. But....Maybe that was the whole point!.",
  },
  {
    id: 8,
    question: "So What's next?",
    answer:
      "you know what? actually I don't know, This could either be mine , more experiments, more stories, and more things worth discovering arc or maybe I am just again gonna play the rotting game in my bed till i get the next idea that feels like me :D.",
  },
  {
    id: 9,
    question: "but! why keep building?",
    answer:
      "Because curiosity is a pretty good reason to be alive on this planet I guess .",
  },
];

function About() {
  const audioRef = useRef(null);

  const [started, setStarted] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [showClimaxToast, setShowClimaxToast] =
  useState(false);  

  // =========================================
  // START EXPERIENCE
  // =========================================

  const startExperience = async () => {
    const audio =
      audioRef.current;

    if (audio) {
      try {
        audio.volume = 0.55;
        audio.muted = false;

        await audio.play();
      } catch (error) {
        console.error(
          "Audio playback failed:",
          error
        );
      }
    }

    setStarted(true);
  };

  // =========================================
  // AUDIO TOGGLE
  // =========================================

  const toggleMute = () => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = !audio.muted;

    setMuted(audio.muted);
  };


 
  // =========================================
  // CLEANUP AUDIO
  // =========================================

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
  if (!started) {
    return;
  }

  const showTimer = window.setTimeout(() => {
    setShowClimaxToast(true);
  }, 1400);

  const hideTimer = window.setTimeout(() => {
    setShowClimaxToast(false);
  }, 7000);

  return () => {
    window.clearTimeout(showTimer);
    window.clearTimeout(hideTimer);
  };
}, [started]);

  return (
    <main className="about-page">

      {/* =========================================
          NORMAL VIDEO BACKGROUND
      ========================================= */}

      <video
        className="about-video"
        src={lilyVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* =========================================
          OVERLAYS
      ========================================= */}

      <div className="about-video-overlay" />

      <div className="about-golden-glow" />

      {/* =========================================
          BACKGROUND AUDIO
      ========================================= */}

      <audio
        ref={audioRef}
        src={aboutMusic}
        preload="auto"
      />

      {/* =========================================
          NAVBAR
      ========================================= */}

      <div className="about-navbar">
        <Navbar light />
      </div>

      {/* =========================================
          INTRO / ENTER SCREEN
      ========================================= */}

      {!started && (
        <div className="about-intro">
          <div className="about-intro-inner">

            <span className="about-intro-eyebrow">
              Pomona
            </span>

            <h1>
              A little story
              <br />
              about why.
            </h1>

            <p>
              Scroll gently.
              Let it unfold.
            </p>

            <button
              type="button"
              className="about-enter"
              onClick={startExperience}
            >
              <FiPlay size={14} />
              Enter
            </button>

          </div>
        </div>
      )}

      {/* =========================================
          MAIN LONG TIMELINE
      ========================================= */}

      <section className="about-timeline">

        {/* INTRO */}

        <div className="about-timeline-intro">
          <span>
            About Pomona
          </span>

          <h2>
            Some things are worth
            slowing down for.
          </h2>
        </div>

        {/* TIMELINE */}

        <div className="about-timeline-track">

          <div className="about-timeline-line" />

          {timelineItems.map(
            (item, index) => (
              <article
                className={`about-timeline-item ${
                  index % 2 === 0
                    ? "left"
                    : "right"
                }`}
                key={item.id}
              >

                {/* CHECKPOINT */}

                <div className="about-sparkle">
                  <span className="sparkle-core" />

                  <span className="sparkle-ray ray-one" />
                  <span className="sparkle-ray ray-two" />
                  <span className="sparkle-ray ray-three" />
                  <span className="sparkle-ray ray-four" />
                </div>

                {/* QUESTION / ANSWER */}

                <div className="about-timeline-card">

                  <span className="about-question-number">
                    0{item.id}
                  </span>

                  <h3>
                    {item.question}
                  </h3>

                  <p>
                    {item.answer}
                  </p>

                </div>

              </article>
            )
          )}

        </div>

        {/* =========================================
            FINAL MESSAGE
        ========================================= */}

        <div className="about-final">

          <span>
            And that's Pomona.
          </span>

          <h2>
            Stay curious.
          </h2>

          <p>
            There is always something
            growing somewhere.
          </p>

        </div>

      </section>

      {/* =========================================
          AUDIO CONTROL
      ========================================= */}

      {started && (
        <button
          type="button"
          className="about-audio-control"
          onClick={toggleMute}
          aria-label={
            muted
              ? "Turn music on"
              : "Mute music"
          }
        >
          {muted ? (
            <FiVolumeX size={15} />
          ) : (
            <FiVolume2 size={15} />
          )}

          <span>
            {muted
              ? "Sound off"
              : "Sound on"}
          </span>
        </button>
      )}

      {showClimaxToast && (
  <div
    className="about-climax-toast"
    role="status"
    aria-live="polite"
  >
    <span className="about-climax-dot" />

    <span>
      please use headphones for the best experience.
    </span>
  </div>
)}

    </main>
  );
}

export default About;