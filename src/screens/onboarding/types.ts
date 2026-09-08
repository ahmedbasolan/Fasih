import type { Dispatch, SetStateAction } from 'react';

/**
 * The contract between `OnboardingFlow` and its step components.
 *
 * `OnboardingFlow` was a 1,441-line file whose twelve `case` bodies closed over
 * parent state implicitly. Writing that coupling down is what makes splitting
 * the file safe: a step can now only reach the state it was given.
 *
 * Leaf names are deliberately identical to the locals they replaced, so the
 * moved JSX is byte-for-byte the same after destructuring. Grouping is by what
 * a step actually needs — most steps take `draft` and nothing else.
 */

/** The profile being assembled. Every field lands in `UserProfile` on finish. */
export interface OnboardingDraft {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  mode: 'career' | 'social';
  setMode: Dispatch<SetStateAction<'career' | 'social'>>;
  /**
   * Whether the learner has actually picked a mode, as opposed to inheriting
   * the default.
   *
   * `mode` has to stay non-optional — it lands in `UserProfile.mode` and in the
   * analytics row's CHECK constraint, so `undefined` must not be able to reach
   * either. But "Choose your path" was not a choice: Career was pre-selected
   * and Continue worked without a decision, which biased every downstream
   * scenario recommendation AND the anonymous mode distribution toward career
   * for anyone who did not think about it.
   *
   * This flag lets the screen show nothing selected and gate Continue, while
   * `mode` keeps a valid value throughout.
   */
  modeChosen: boolean;
  chooseMode: (mode: 'career' | 'social') => void;
  /**
   * Arabic marks the speaker's own gender, so this is not cosmetic: it selects
   * which verb forms are taught AND gates scenarios via `requiresGender`.
   */
  gender: 'male' | 'female' | undefined;
  setGender: Dispatch<SetStateAction<'male' | 'female' | undefined>>;
  role: string;
  setRole: Dispatch<SetStateAction<string>>;
  profession: string;
  setProfession: Dispatch<SetStateAction<string>>;
  selectedGoals: string[];
  toggleGoal: (id: string) => void;
  plan: 'monthly' | 'yearly';
  setPlan: Dispatch<SetStateAction<'monthly' | 'yearly'>>;
  /** The name, typed out in Arabic. Derived from `name` in the parent. */
  typedGreeting: string;
}

/** The hold-to-commit ring on step 5. Owned by the parent because it runs a timer. */
export interface OnboardingHold {
  holdProgress: number;
  holdComplete: boolean;
  startHold: () => void;
  endHold: () => void;
  /** Circumference of the progress ring, for the stroke-dash maths. */
  circum: number;
}

/** The taster scenario and the notification opt-ins, steps 6-8. */
export interface OnboardingQuickWin {
  phraseRevealed: boolean;
  setPhraseRevealed: Dispatch<SetStateAction<boolean>>;
  /**
   * Distinct from `phraseRevealed`, which resets on every step change. This one
   * is latched, and it is what the completion checklist actually reads.
   */
  setPhraseEverRevealed: Dispatch<SetStateAction<boolean>>;
  setScenarioCompleted: Dispatch<SetStateAction<boolean>>;
  toggleNotifs: boolean[];
  setToggleNotifs: Dispatch<SetStateAction<boolean[]>>;
}

export interface OnboardingStepProps {
  step: number;
  next: () => void;
  /** Steps 9-11: leave without subscribing. Confirmed by an Alert in the parent. */
  skip: () => void;
  /** Steps 9-11: start the trial on the selected plan, then finish. */
  finishWithTrial: () => void;
  draft: OnboardingDraft;
  hold: OnboardingHold;
  quickWin: OnboardingQuickWin;
}
