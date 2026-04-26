import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CameraPlus, Check } from "@phosphor-icons/react";

import customPostcardImage from "../assets/figma/custom.png";
import letterValueHero from "../assets/figma/content-image.png";
import keepsakeHeroImage from "../assets/figma/keepsake.png";
import foundingMemberReserveHero from "../assets/figma/may.png";

const TOTAL_STEPS = 11;
const MAX_PHOTO_BYTES = 1024 * 1024; /* 1 MB */

const AGE_OPTIONS = ["0-1 Years", "1-3 Years", "4-7 Years", "8-11 Years", "12+ Years"];

const MEMORABLE_MOMENT_OPTIONS = [
  "The way they greet me when I come home",
  "Always knows when I'm sad",
  "The funny little habits only I know about",
  "Sleeping curled up next to me every night",
  "Making even bad days better",
  "That ridiculous food obsession",
];

const POSTCARD_BULLETS = [
  "Created from your dog's photo",
  "Designed around a monthly theme",
  "Made to keep, to gift or to frame",
];

const VALUE_LETTER_BULLETS = [
  "You share a few moments from your month together",
  "We turn them into a letter from your dog",
  "Mailed to your home to keep forever",
];

const KEEPSAKE_OFFER_BULLETS = [
  "a letter from your dog, just for you",
  "custom illustration of your dog",
  "a dog themed bookmark",
];
const MAX_TRAITS = 5;

const TRAIT_OPTIONS = [
  "Playful",
  "Chaotic",
  "Cuddly",
  "Dramatic",
  "Food obsessed",
  "Loyal",
  "Silly",
  "Protective",
  "Lazy",
  "Curious",
];

const SPOT_TIMELINE = [
  { id: "today", kicker: "TODAY", done: true, text: "Reserve your spot (no charge today)" },
  {
    id: "may1",
    kicker: "MAY 1",
    done: false,
    text: "Your subscription starts — we'll send you a few questions about your month with your dog",
  },
  {
    id: "eomay",
    kicker: "END OF MAY",
    done: false,
    text: "Your first letter is mailed. Allow 1–2 weeks for delivery (US)",
  },
  { id: "after", kicker: "AFTER THAT", done: false, priceLine: true },
];

/* … → Reserve → Save My Spot / timeline (finish) */

export default function OnboardingFlow({ onExit, onComplete }) {
  const [step, setStep] = useState(1);
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [traits, setTraits] = useState([]);
  const [memorableMoment, setMemorableMoment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const progress = (step / TOTAL_STEPS) * 100;
  const isValueHeroLayout = step === 4 || step === 6 || step === 9;
  /* Full-bleed value slides: no top progress — back on the hero */
  const hideTopHeader = step === 4 || step === 6 || step === 9;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onExit();
    }
  };

  const submitName = (e) => {
    e.preventDefault();
    if (!dogName.trim()) return;
    setStep(2);
  };

  const submitBreed = (e) => {
    e.preventDefault();
    if (!breed.trim()) return;
    setStep(3);
  };

  const submitAge = (e) => {
    e.preventDefault();
    if (!ageRange) return;
    setStep(6);
  };

  const toggleTrait = (label) => {
    setTraits((prev) => {
      if (prev.includes(label)) {
        return prev.filter((t) => t !== label);
      }
      if (prev.length >= MAX_TRAITS) {
        return prev;
      }
      return [...prev, label];
    });
  };

  const submitTraits = (e) => {
    e.preventDefault();
    if (traits.length < 1) return;
    setStep(4);
  };

  const continueFromLetter = () => {
    setStep(5);
  };

  const continueFromPostcard = () => {
    setStep(7);
  };

  const submitMemorableMoment = (e) => {
    e.preventDefault();
    if (!memorableMoment) return;
    setStep(9);
  };

  const handlePhotoFile = (file) => {
    setPhotoError("");
    if (!file) {
      setPhotoFile(null);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Please choose an image under 1 MB.");
      return;
    }
    const lower = file.name.toLowerCase();
    const okByName = /\.(jpe?g|png)$/i.test(lower);
    const okByType = /^image\/(jpeg|png)$/i.test(file.type);
    if (!okByName && !okByType) {
      setPhotoError("Use JPG, JPEG, or PNG only.");
      return;
    }
    setPhotoFile(file);
  };

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const submitPhoto = (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setStep(8);
  };

  const finishOnboarding = () => {
    if (typeof onComplete === "function") {
      onComplete({
        dogName: dogName.trim(),
        breed: breed.trim(),
        ageRange,
        traits: [...traits],
        memorableMoment,
        photo: photoFile,
        photoName: photoFile?.name,
      });
    }
  };

  const continueToReserve = () => {
    setStep(10);
  };

  const continueToSpotTimeline = () => {
    setStep(11);
  };

  const displayName = dogName.trim() || "your dog";
  const canContinueTraits = traits.length >= 1 && traits.length <= MAX_TRAITS;

  return (
    <div
      className={
        isValueHeroLayout ? "onboard-screen onboard-screen--step4" : "onboard-screen"
      }
    >
      {!hideTopHeader && (
        <header className="onboard-header">
          <button
            type="button"
            className="onboard-back"
            onClick={handleBack}
            aria-label={step === 1 ? "Go back to home" : "Previous step"}
          >
            <ArrowLeft size={20} weight="regular" className="onboard-back-icon" />
          </button>
          <div
            className="onboard-progress"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-label={`Step ${step} of ${TOTAL_STEPS}`}
          >
            <div className="onboard-progress-track" />
            <div className="onboard-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="onboard-header-spacer" aria-hidden="true" />
        </header>
      )}

      {step === 1 && (
        <>
          <form id="onboard-step-1" className="onboard-main" onSubmit={submitName}>
            <h1 className="onboard-title">What&apos;s your dog&apos;s name?</h1>
            <label className="visually-hidden" htmlFor="dog-name">
              Dog name
            </label>
            <div className="onboard-input-wrap">
              <input
                id="dog-name"
                className="onboard-input"
                type="text"
                name="dogName"
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Bella, Max, or Daisy"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
              />
            </div>
          </form>
          <footer className="onboard-footer">
            <button type="submit" className="onboard-continue" form="onboard-step-1" disabled={!dogName.trim()}>
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 2 && (
        <>
          <form id="onboard-step-2" className="onboard-main" onSubmit={submitBreed}>
            <div className="onboard-step2-copy">
              <h1 className="onboard-title">What breed is {displayName}?</h1>
              <p className="onboard-lede">This shapes how we write your dog&apos;s letter.</p>
            </div>
            <label className="visually-hidden" htmlFor="dog-breed">
              Dog breed
            </label>
            <div className="onboard-input-wrap">
              <input
                id="dog-breed"
                className="onboard-input"
                type="text"
                name="breed"
                autoComplete="off"
                autoCapitalize="words"
                placeholder="e.g. Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
          </form>
          <footer className="onboard-footer">
            <button type="submit" className="onboard-continue" form="onboard-step-2" disabled={!breed.trim()}>
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 3 && (
        <>
          <form id="onboard-step-traits" className="onboard-main onboard-main--traits" onSubmit={submitTraits}>
            <div className="onboard-step3-copy">
              <h1 className="onboard-title">What&apos;s {displayName} like?</h1>
              <p className="onboard-lede onboard-lede--step3">Choose up to 5</p>
            </div>
            <div className="onboard-traits" role="group" aria-label="Personality traits">
              {TRAIT_OPTIONS.map((label) => {
                const selected = traits.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    className={selected ? "onboard-trait is-selected" : "onboard-trait"}
                    onClick={() => toggleTrait(label)}
                    aria-pressed={selected}
                  >
                    <span className="onboard-trait-label">{label}</span>
                    {selected ? (
                      <Check className="onboard-trait-check" size={20} weight="bold" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </form>
          <footer className="onboard-footer">
            <button
              type="submit"
              className="onboard-continue"
              form="onboard-step-traits"
              disabled={!canContinueTraits}
            >
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 4 && (
        <div className="onboard-step4 onboard-step4--letter">
          <div className="onboard-step4-hero-wrap">
            <button
              type="button"
              className="onboard-step4-back"
              onClick={handleBack}
              aria-label="Previous step"
            >
              <ArrowLeft size={20} weight="regular" className="onboard-step4-back-icon" />
            </button>
            <figure className="onboard-step4-hero" aria-hidden="false">
              <img src={letterValueHero} alt="A dog beside a personal letter on the sofa" />
            </figure>
          </div>
          <div className="onboard-step4-content">
            <h2 className="onboard-step4-title">A letter from your dog, written just for you.</h2>
            <ul className="onboard-step4-list" role="list">
              {VALUE_LETTER_BULLETS.map((line) => (
                <li key={line} className="onboard-step4-item">
                  <span className="onboard-step4-check" aria-hidden="true">
                    <Check className="onboard-step4-check-glyph" size={14} weight="bold" />
                  </span>
                  <span className="onboard-step4-text">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <footer className="onboard-step4-footer">
            <button type="button" className="onboard-continue" onClick={continueFromLetter}>
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </div>
      )}

      {step === 5 && (
        <>
          <form id="onboard-step-age" className="onboard-main onboard-main--age" onSubmit={submitAge}>
            <div className="onboard-step2-copy">
              <h1 className="onboard-title">How old is {displayName}?</h1>
              <p className="onboard-lede">This shapes how we write your dog&apos;s letter.</p>
            </div>
            <div className="onboard-age-list" role="group" aria-label="Dog age">
              {AGE_OPTIONS.map((label) => {
                const selected = ageRange === label;
                return (
                  <button
                    key={label}
                    type="button"
                    className={selected ? "onboard-age-option is-selected" : "onboard-age-option"}
                    onClick={() => setAgeRange(label)}
                    aria-pressed={selected}
                  >
                    <span className="onboard-age-label">{label}</span>
                    {selected ? (
                      <Check className="onboard-age-check" size={20} weight="bold" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </form>
          <footer className="onboard-footer">
            <button type="submit" className="onboard-continue" form="onboard-step-age" disabled={!ageRange}>
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 6 && (
        <div className="onboard-step4 onboard-step4--postcard">
          <div className="onboard-step4-hero-wrap">
            <button
              type="button"
              className="onboard-step4-back"
              onClick={handleBack}
              aria-label="Previous step"
            >
              <ArrowLeft size={20} weight="regular" className="onboard-step4-back-icon" />
            </button>
            <figure className="onboard-step4-hero" aria-hidden="false">
              <img
                src={customPostcardImage}
                alt="Your photo becomes a custom illustrated postcard of your dog"
              />
            </figure>
          </div>
          <div className="onboard-step4-content">
            <h2 className="onboard-step4-title">A custom illustrated postcard of your dog.</h2>
            <ul className="onboard-step4-list" role="list">
              {POSTCARD_BULLETS.map((line) => (
                <li key={line} className="onboard-step4-item">
                  <span className="onboard-step4-check" aria-hidden="true">
                    <Check className="onboard-step4-check-glyph" size={14} weight="bold" />
                  </span>
                  <span className="onboard-step4-text">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <footer className="onboard-step4-footer">
            <button type="button" className="onboard-continue" onClick={continueFromPostcard}>
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </div>
      )}

      {step === 7 && (
        <>
          <form id="onboard-step-photo" className="onboard-main onboard-main--photo" onSubmit={submitPhoto}>
            <div className="onboard-step2-copy">
              <h1 className="onboard-title">
                Add {displayName === "your dog" ? "your dog" : `${displayName}`}&apos;s Photo
              </h1>
              <p className="onboard-lede">
                Choose a photo that shows only {displayName === "your dog" ? "your dog" : displayName}.
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="dog-photo"
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                handlePhotoFile(f ?? null);
              }}
            />
            <label htmlFor="dog-photo" className="onboard-photo-drop">
              {photoPreview ? (
                <span className="onboard-photo-preview-wrap">
                  <img src={photoPreview} alt="" className="onboard-photo-preview" />
                </span>
              ) : null}
              <span className="onboard-photo-drop-inner">
                <CameraPlus className="onboard-photo-icon" size={40} weight="duotone" aria-hidden="true" />
                <span className="onboard-photo-tap">Tap to Upload</span>
                <span className="onboard-photo-hint">JPG, JPEG, PNG less than 1MB</span>
              </span>
            </label>
            {photoError ? <p className="onboard-photo-error">{photoError}</p> : null}
          </form>
          <footer className="onboard-footer onboard-footer--photo">
            <button
              type="submit"
              className="onboard-continue"
              form="onboard-step-photo"
              disabled={!photoFile}
            >
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 8 && (
        <>
          <form
            id="onboard-step-memorable"
            className="onboard-main onboard-main--memorable"
            onSubmit={submitMemorableMoment}
          >
            <h1 className="onboard-title onboard-title--memorable">
              What&apos;s one thing {displayName} does you never want to forget?
            </h1>
            <div
              className="onboard-age-list onboard-memorable-list"
              role="group"
              aria-label="A moment to remember"
            >
              {MEMORABLE_MOMENT_OPTIONS.map((label) => {
                const selected = memorableMoment === label;
                return (
                  <button
                    key={label}
                    type="button"
                    className={selected ? "onboard-age-option is-selected" : "onboard-age-option"}
                    onClick={() => setMemorableMoment(label)}
                    aria-pressed={selected}
                  >
                    <span className="onboard-age-label">{label}</span>
                    {selected ? (
                      <Check className="onboard-age-check" size={20} weight="bold" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </form>
          <footer className="onboard-footer">
            <button
              type="submit"
              className="onboard-continue"
              form="onboard-step-memorable"
              disabled={!memorableMoment}
            >
              Continue
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 9 && (
        <div className="onboard-step4 onboard-step4--keepsake">
          <div className="onboard-step4-hero-wrap">
            <button
              type="button"
              className="onboard-step4-back"
              onClick={handleBack}
              aria-label="Previous step"
            >
              <ArrowLeft size={20} weight="regular" className="onboard-step4-back-icon" />
            </button>
            <figure className="onboard-step4-hero" aria-hidden="false">
              <img
                src={keepsakeHeroImage}
                alt="Letter, illustrated postcard, and dog bookmark on a table"
              />
            </figure>
          </div>
          <div className="onboard-step4-content">
            <h2 className="onboard-step4-title">A keepsake you&apos;ll hold onto for years.</h2>
            <p className="onboard-step4-prose">
              The little moments with your dog don&apos;t stay little forever. Each month, we turn them
              into something personal and worth keeping.
            </p>
            <ul className="onboard-step4-list" role="list">
              {KEEPSAKE_OFFER_BULLETS.map((line) => (
                <li key={line} className="onboard-step4-item">
                  <span className="onboard-step4-check" aria-hidden="true">
                    <Check className="onboard-step4-check-glyph" size={14} weight="bold" />
                  </span>
                  <span className="onboard-step4-text">{line}</span>
                </li>
              ))}
            </ul>
            <p className="onboard-step4-footnote">Every month is different. Made just for you.</p>
          </div>
          <footer className="onboard-step4-footer">
            <button type="button" className="onboard-continue" onClick={continueToReserve}>
              See early member offer
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </div>
      )}

      {step === 10 && (
        <>
          <form
            id="onboard-step-reserve"
            className="onboard-main onboard-main--reserve"
            onSubmit={(e) => {
              e.preventDefault();
              continueToSpotTimeline();
            }}
          >
            <div className="onboard-reserve-copy">
              <h1 className="onboard-title onboard-title--reserve">
                We&apos;re writing letters for our first 100 dog lovers. We&apos;d love for you to be
                one of them.
              </h1>
              <p className="onboard-lede">
                No payment today. Just reserve your first letter with your card.
              </p>
            </div>
            <figure className="onboard-reserve-visual" aria-hidden="false">
              <img
                src={foundingMemberReserveHero}
                alt="Letter, bookmark, and illustrated postcard of your dog"
              />
            </figure>
          </form>
          <footer className="onboard-footer onboard-footer--reserve">
            <p className="onboard-reserve-pricing">
              As a founding member, your first letter is just $11, then $18/month. Cancel any time.
            </p>
            <button type="submit" className="onboard-continue" form="onboard-step-reserve">
              Reserve My First Letter
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}

      {step === 11 && (
        <>
          <div className="onboard-main onboard-main--spot-timeline">
            <h1 className="onboard-title onboard-title--spot-timeline">
              100 spots. Personalized to each dog. Yours is waiting.
            </h1>
            <ol className="onboard-timeline" role="list">
              {SPOT_TIMELINE.map((item, index) => (
                <li key={item.id} className="onboard-timeline-item">
                  <div className="onboard-timeline-gutter">
                    {item.done ? (
                      <div className="onboard-timeline-node onboard-timeline-node--done">
                        <Check size={14} weight="bold" className="onboard-timeline-check" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className="onboard-timeline-node" aria-hidden="true">
                        <span className="onboard-timeline-dot" />
                      </div>
                    )}
                    {index < SPOT_TIMELINE.length - 1 ? (
                      <div className="onboard-timeline-stem" aria-hidden="true" />
                    ) : null}
                  </div>
                  <div className="onboard-timeline-body">
                    <p className="onboard-timeline-kicker">{item.kicker}</p>
                    {item.priceLine ? (
                      <p className="onboard-timeline-text">
                        <strong className="onboard-timeline-price">$18/month</strong>
                        <span> — cancel any time</span>
                      </p>
                    ) : (
                      <p className="onboard-timeline-text">{item.text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="onboard-timeline-caveat">
              If you change your mind, cancel before May 1 and you won&apos;t be charged.
            </p>
          </div>
          <footer className="onboard-footer onboard-footer--spot-timeline">
            <p className="onboard-spot-legal">
              You&apos;ll enter your card details securely through Stripe. By continuing, you authorize us
              to charge $11 on May 1 unless you cancel before then.
            </p>
            <button type="button" className="onboard-continue" onClick={finishOnboarding}>
              Save My Spot
              <ArrowRight size={18} weight="bold" className="onboard-continue-icon" />
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
