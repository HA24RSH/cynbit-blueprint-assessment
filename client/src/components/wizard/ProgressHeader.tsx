import { Check } from "lucide-react";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  "Service",
  "Requirements",
  "Technical details",
  "Review",
];

export default function ProgressHeader({
  currentStep,
  totalSteps = 4,
}: ProgressHeaderProps) {
  return (
    <div className="progress-header">
      <div className="progress-label">
        <span>PROJECT DISCOVERY</span>
        <span>STEP {currentStep} OF {totalSteps}</span>
      </div>

      <div className="progress-track">
        {steps.slice(0, totalSteps).map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div
              className="progress-step"
              key={step}
              aria-current={active ? "step" : undefined}
            >
              <div
                className={[
                  "progress-indicator",
                  completed ? "completed" : "",
                  active ? "active" : "",
                ].join(" ")}
              >
                {completed ? <Check size={15} /> : stepNumber}
              </div>

              <span className={active ? "active-label" : ""}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}