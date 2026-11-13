import "../App.css";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleHelp,
  Cloud,
  Code2,
  Copy,
  Download,
  FileText,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  Clock3,
  Send,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import ProgressHeader from "../components/wizard/ProgressHeader";

import type {
  ServiceCategory,
  ProjectStage,
} from "../types/project";

import { submitProject } from "../services/project.service";

/* =========================================
   TYPES
========================================= */

interface Service {
  id: ServiceCategory;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Choice {
  value: string;
  label: string;
  description?: string;
}

interface ProjectAnswers {
  projectStage: ProjectStage | "";
  projectDescription: string;

  // Software development
  projectType: string;
  targetUsers: string;
  features: string[];

  // AI and automation
  automationType: string;
  currentWorkflow: string;
  integrations: string;

  // Cloud and DevOps
  infrastructureStage: string;
  cloudNeeds: string[];

  // Digital marketing
  marketingGoal: string;
  marketingChannels: string[];
  targetAudience: string;

  // Not sure yet
  unsureGoal: string;

  // Technical details
  preferredTechnologies: string[];
  additionalIntegrations: string;
  expectedScale: string;
  timeline: string;
  budgetRange: string;
  securityNeeds: string[];
}

interface ContactDetails {
  name: string;
  email: string;
}

/* =========================================
   SERVICE DATA
========================================= */

const services: Service[] = [
  {
    id: "software-development",
    title: "Software Development",
    description:
      "Websites, applications, SaaS platforms and custom software.",
    icon: Code2,
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    description:
      "AI agents, intelligent workflows and business automation.",
    icon: BrainCircuit,
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    description:
      "Cloud infrastructure, deployment and scalable systems.",
    icon: Cloud,
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description:
      "SEO, digital campaigns and business growth solutions.",
    icon: Megaphone,
  },
  {
    id: "not-sure",
    title: "Not sure yet",
    description:
      "I have an idea but need help finding the right solution.",
    icon: CircleHelp,
  },
];

const benefits = [
  {
    icon: FileText,
    title: "Clear requirements",
    description:
      "Turn your initial idea into a structured project brief.",
  },
  {
    icon: Target,
    title: "Relevant questions",
    description:
      "Only answer questions that matter to your project.",
  },
  {
    icon: Clock3,
    title: "A better starting point",
    description:
      "Save time before your first project discussion.",
  },
];

/* =========================================
   INITIAL FORM DATA
========================================= */

const initialAnswers: ProjectAnswers = {
  projectStage: "",
  projectDescription: "",

  projectType: "",
  targetUsers: "",
  features: [],

  automationType: "",
  currentWorkflow: "",
  integrations: "",

  infrastructureStage: "",
  cloudNeeds: [],

  marketingGoal: "",
  marketingChannels: [],
  targetAudience: "",

  unsureGoal: "",

  preferredTechnologies: [],
  additionalIntegrations: "",
  expectedScale: "",
  timeline: "",
  budgetRange: "",
  securityNeeds: [],
};

/* =========================================
   REUSABLE SINGLE-CHOICE COMPONENT
========================================= */

interface ChoiceGroupProps {
  options: Choice[];
  value: string;
  onChange: (value: string) => void;
}

function ChoiceGroup({
  options,
  value,
  onChange,
}: ChoiceGroupProps) {
  return (
    <div className="choice-grid">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={`choice-option ${
              selected ? "selected" : ""
            }`}
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
          >
            <span className="choice-title">
              {option.label}
            </span>

            {option.description && (
              <span className="choice-description">
                {option.description}
              </span>
            )}

            <span className="choice-check">
              {selected && <Check size={14} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================
   REUSABLE MULTI-SELECT COMPONENT
========================================= */

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

function MultiSelectGroup({
  options,
  value,
  onChange,
}: MultiSelectProps) {
  function toggleOption(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="multi-select-grid">
      {options.map((option) => {
        const selected = value.includes(option);

        return (
          <button
            key={option}
            type="button"
            className={`multi-select-option ${
              selected ? "selected" : ""
            }`}
            onClick={() => toggleOption(option)}
            aria-pressed={selected}
          >
            <span className="multi-select-check">
              {selected && <Check size={12} />}
            </span>

            {option}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================
   REUSABLE DROPDOWN COMPONENT
========================================= */

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
      </label>

      <select
        className="text-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================
   MAIN PROJECT DISCOVERY COMPONENT
========================================= */

export default function ProjectDiscovery() {
  /* =====================================
     STATE
  ===================================== */

  const [selectedService, setSelectedService] =
    useState<ServiceCategory | null>(null);

  const [currentStep, setCurrentStep] = useState(1);

  const [answers, setAnswers] =
    useState<ProjectAnswers>(initialAnswers);

  const [contact, setContact] = useState<ContactDetails>({
    name: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [submissionReference, setSubmissionReference] =
    useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  /* =====================================
     DERIVED VALUES
  ===================================== */

  const selectedServiceInfo = services.find(
    (service) => service.id === selectedService
  );

  const canContinue =
    answers.projectStage !== "" &&
    answers.projectDescription.trim().length >= 20;

  const contactIsValid =
    contact.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());

  /* =====================================
     STATE UPDATE FUNCTIONS
  ===================================== */

  function updateAnswer<K extends keyof ProjectAnswers>(
    key: K,
    value: ProjectAnswers[K]
  ) {
    setAnswers((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleContinue() {
    if (selectedService) {
      setCurrentStep(2);
    }
  }

  function handleNextStep() {
    if (canContinue) {
      setCurrentStep(3);
    }
  }

  /* =====================================
     TECHNICAL OPTIONS
  ===================================== */

  function getTechnicalOptions(): string[] {
    switch (selectedService) {
      case "software-development":
        return [
          "React",
          "Next.js",
          "Node.js",
          "Python",
          "Java",
          ".NET",
          "Flutter",
          "Other",
        ];

      case "ai-automation":
        return [
          "Python",
          "OpenAI API",
          "Google Gemini",
          "Anthropic Claude",
          "LangChain",
          "n8n",
          "Zapier",
          "Other",
        ];

      case "cloud-devops":
        return [
          "AWS",
          "Microsoft Azure",
          "Google Cloud",
          "Docker",
          "Kubernetes",
          "Terraform",
          "GitHub Actions",
          "Other",
        ];

      case "digital-marketing":
        return [
          "Google Ads",
          "Meta Ads",
          "Google Analytics",
          "SEO Tools",
          "HubSpot",
          "Salesforce",
          "Mailchimp",
          "Other",
        ];

      default:
        return [
          "React",
          "Node.js",
          "Python",
          "AWS",
          "Firebase",
          "PostgreSQL",
          "No preference",
          "Other",
        ];
    }
  }

  /* =====================================
     STEP 2 - SERVICE-SPECIFIC QUESTIONS
  ===================================== */

  function renderServiceQuestions() {
    switch (selectedService) {
      case "software-development":
        return (
          <>
            <div className="question-section">
              <label className="field-label">
                What type of software do you want to build?
              </label>

              <ChoiceGroup
                value={answers.projectType}
                onChange={(value) =>
                  updateAnswer("projectType", value)
                }
                options={[
                  { value: "website", label: "Website" },
                  { value: "web-app", label: "Web Application" },
                  { value: "saas", label: "SaaS Platform" },
                  {
                    value: "mobile-app",
                    label: "Mobile Application",
                  },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div className="question-section">
              <SelectField
                label="Who will primarily use this product?"
                value={answers.targetUsers}
                onChange={(value) =>
                  updateAnswer("targetUsers", value)
                }
                options={[
                  "Internal employees",
                  "Individual customers",
                  "Businesses",
                  "General public",
                  "Multiple user types",
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                Which features would you like?
              </label>

              <p className="field-help">
                Select all that apply.
              </p>

              <MultiSelectGroup
                value={answers.features}
                onChange={(value) =>
                  updateAnswer("features", value)
                }
                options={[
                  "User authentication",
                  "Admin dashboard",
                  "Payment integration",
                  "API integration",
                  "Analytics and reporting",
                  "Notifications",
                  "Real-time features",
                  "Other",
                ]}
              />
            </div>
          </>
        );

      case "ai-automation":
        return (
          <>
            <div className="question-section">
              <label className="field-label">
                What would you like to automate?
              </label>

              <ChoiceGroup
                value={answers.automationType}
                onChange={(value) =>
                  updateAnswer("automationType", value)
                }
                options={[
                  {
                    value: "customer-support",
                    label: "Customer Support",
                  },
                  {
                    value: "sales-leads",
                    label: "Sales & Lead Management",
                  },
                  {
                    value: "documents",
                    label: "Document Processing",
                  },
                  {
                    value: "internal-workflows",
                    label: "Internal Workflows",
                  },
                  {
                    value: "data-analysis",
                    label: "Data Analysis",
                  },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div className="question-section">
              <SelectField
                label="How is this process currently handled?"
                value={answers.currentWorkflow}
                onChange={(value) =>
                  updateAnswer("currentWorkflow", value)
                }
                options={[
                  "Completely manual",
                  "Spreadsheets and documents",
                  "Using existing software",
                  "Partially automated",
                  "Not yet established",
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                Which tools or platforms do you currently use?
              </label>

              <input
                className="text-input"
                value={answers.integrations}
                onChange={(event) =>
                  updateAnswer("integrations", event.target.value)
                }
                placeholder="e.g. WhatsApp, HubSpot, Google Sheets..."
              />
            </div>
          </>
        );

      case "cloud-devops":
        return (
          <>
            <div className="question-section">
              <label className="field-label">
                What is your current infrastructure situation?
              </label>

              <ChoiceGroup
                value={answers.infrastructureStage}
                onChange={(value) =>
                  updateAnswer("infrastructureStage", value)
                }
                options={[
                  {
                    value: "new",
                    label: "Starting from scratch",
                  },
                  {
                    value: "existing-cloud",
                    label: "Already using cloud",
                  },
                  {
                    value: "on-premises",
                    label: "On-premises infrastructure",
                  },
                  {
                    value: "migration",
                    label: "Planning a migration",
                  },
                  {
                    value: "not-sure",
                    label: "Not sure",
                  },
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                What capabilities do you need?
              </label>

              <p className="field-help">
                Select all that apply.
              </p>

              <MultiSelectGroup
                value={answers.cloudNeeds}
                onChange={(value) =>
                  updateAnswer("cloudNeeds", value)
                }
                options={[
                  "Cloud migration",
                  "Deployment automation",
                  "Infrastructure setup",
                  "Scalability",
                  "Monitoring",
                  "Security",
                  "Backup and recovery",
                  "CI/CD pipelines",
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                Do you have a preferred cloud provider?
              </label>

              <input
                className="text-input"
                value={answers.integrations}
                onChange={(event) =>
                  updateAnswer("integrations", event.target.value)
                }
                placeholder="e.g. AWS, Azure, Google Cloud or none"
              />
            </div>
          </>
        );

      case "digital-marketing":
        return (
          <>
            <div className="question-section">
              <label className="field-label">
                What is your primary marketing goal?
              </label>

              <ChoiceGroup
                value={answers.marketingGoal}
                onChange={(value) =>
                  updateAnswer("marketingGoal", value)
                }
                options={[
                  {
                    value: "lead-generation",
                    label: "Generate More Leads",
                  },
                  {
                    value: "brand-awareness",
                    label: "Build Brand Awareness",
                  },
                  {
                    value: "traffic",
                    label: "Increase Website Traffic",
                  },
                  {
                    value: "sales",
                    label: "Increase Sales",
                  },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                Which channels interest you?
              </label>

              <p className="field-help">
                Select all that apply.
              </p>

              <MultiSelectGroup
                value={answers.marketingChannels}
                onChange={(value) =>
                  updateAnswer("marketingChannels", value)
                }
                options={[
                  "Search Engine Optimization",
                  "Paid Advertising",
                  "Social Media Marketing",
                  "Content Marketing",
                  "Email Marketing",
                  "Not sure yet",
                ]}
              />
            </div>

            <div className="question-section">
              <label className="field-label">
                Who is your target audience?
              </label>

              <input
                className="text-input"
                value={answers.targetAudience}
                onChange={(event) =>
                  updateAnswer("targetAudience", event.target.value)
                }
                placeholder="Describe your ideal customers..."
              />
            </div>
          </>
        );

      case "not-sure":
        return (
          <div className="question-section">
            <label className="field-label">
              What are you mainly trying to achieve?
            </label>

            <ChoiceGroup
              value={answers.unsureGoal}
              onChange={(value) =>
                updateAnswer("unsureGoal", value)
              }
              options={[
                {
                  value: "reduce-manual-work",
                  label: "Reduce Manual Work",
                },
                {
                  value: "customer-experience",
                  label: "Improve Customer Experience",
                },
                {
                  value: "digital-product",
                  label: "Build a Digital Product",
                },
                {
                  value: "performance",
                  label: "Improve Performance",
                },
                {
                  value: "business-growth",
                  label: "Grow My Business",
                },
                {
                  value: "explore-options",
                  label: "Explore My Options",
                },
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  }

  /* =====================================
     STEP 4 - BLUEPRINT DATA
  ===================================== */

  function humanize(value: string): string {
    if (!value) return "Not specified";

    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getProjectStageLabel(): string {
    if (!answers.projectStage) return "Not specified";

    const labels: Record<ProjectStage, string> = {
      "new-project": "New Project",
      "existing-project": "Existing Project",
      improvement: "Existing Project Improvement",
      exploring: "Exploring Possibilities",
    };

    return labels[answers.projectStage];
  }

  function getServiceSpecificDetails() {
    let details: { label: string; value: string }[] = [];

    switch (selectedService) {
      case "software-development":
        details = [
          {
            label: "Project Type",
            value: humanize(answers.projectType),
          },
          {
            label: "Target Users",
            value: answers.targetUsers,
          },
          {
            label: "Required Features",
            value: answers.features.join(", "),
          },
        ];
        break;

      case "ai-automation":
        details = [
          {
            label: "Automation Use Case",
            value: humanize(answers.automationType),
          },
          {
            label: "Current Workflow",
            value: answers.currentWorkflow,
          },
          {
            label: "Existing Tools",
            value: answers.integrations,
          },
        ];
        break;

      case "cloud-devops":
        details = [
          {
            label: "Infrastructure Stage",
            value: humanize(answers.infrastructureStage),
          },
          {
            label: "Required Capabilities",
            value: answers.cloudNeeds.join(", "),
          },
          {
            label: "Preferred Cloud Provider",
            value: answers.integrations,
          },
        ];
        break;

      case "digital-marketing":
        details = [
          {
            label: "Marketing Goal",
            value: humanize(answers.marketingGoal),
          },
          {
            label: "Marketing Channels",
            value: answers.marketingChannels.join(", "),
          },
          {
            label: "Target Audience",
            value: answers.targetAudience,
          },
        ];
        break;

      case "not-sure":
        details = [
          {
            label: "Primary Objective",
            value: humanize(answers.unsureGoal),
          },
        ];
        break;
    }

    return details.filter((detail) => detail.value.trim().length > 0);
  }

  /* =====================================
     TECHNICAL RECOMMENDATIONS
  ===================================== */

  function getTechnicalRecommendations(): string[] {
    switch (selectedService) {
      case "software-development":
        return [
          "Define frontend, backend and database architecture based on the application type.",
          "Establish API contracts, authentication and data modelling requirements.",
          "Plan deployment, monitoring and testing before development.",
        ];

      case "ai-automation":
        return [
          "Map existing workflows and identify suitable automation opportunities.",
          "Evaluate AI models and integrations against the intended use case.",
          "Define human review, error handling and data privacy requirements.",
        ];

      case "cloud-devops":
        return [
          "Assess existing infrastructure and migration requirements.",
          "Define deployment automation, monitoring and backup strategies.",
          "Evaluate scalability, access control and infrastructure security.",
        ];

      case "digital-marketing":
        return [
          "Define measurable marketing goals and conversion metrics.",
          "Identify relevant channels for the intended target audience.",
          "Establish analytics and campaign performance tracking.",
        ];

      default:
        return [
          "Clarify the business problem and desired outcome.",
          "Evaluate possible solutions before selecting a technology stack.",
          "Define project scope and priorities through an initial discovery discussion.",
        ];
    }
  }

  /* =====================================
     BLUEPRINT TEXT GENERATION
  ===================================== */

  function buildBlueprintText(): string {
    const details = getServiceSpecificDetails();

    const recommendations = getTechnicalRecommendations();

    return [
      "CYNBIT BLUEPRINT",
      "PROJECT DISCOVERY SUMMARY",
      "",
      `Service: ${selectedServiceInfo?.title ?? "Not specified"}`,
      `Project Stage: ${getProjectStageLabel()}`,
      "",
      "BUSINESS PROBLEM",
      answers.projectDescription,
      "",
      "SERVICE-SPECIFIC REQUIREMENTS",
      ...details.map(
        (detail) => `${detail.label}: ${detail.value}`
      ),
      "",
      "TECHNICAL DETAILS",
      `Preferred Technologies: ${
        answers.preferredTechnologies.join(", ") || "Not specified"
      }`,
      `Integrations: ${
        answers.additionalIntegrations || "Not specified"
      }`,
      `Expected Scale: ${
        answers.expectedScale || "Not specified"
      }`,
      `Security Requirements: ${
        answers.securityNeeds.join(", ") || "Not specified"
      }`,
      `Timeline: ${answers.timeline || "Not specified"}`,
      `Budget: ${answers.budgetRange || "Not specified"}`,
      "",
      "INITIAL TECHNICAL CONSIDERATIONS",
      ...recommendations.map((item) => `- ${item}`),
      "",
      "Note: This is an initial discovery summary, not a final technical specification or quotation.",
      "",
      "Generated using Cynbit Blueprint.",
    ].join("\n");
  }

  /* =====================================
     COPY BLUEPRINT
  ===================================== */

  async function handleCopyBlueprint() {
    try {
      await navigator.clipboard.writeText(buildBlueprintText());
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy blueprint:", error);

      window.alert(
        "Unable to access clipboard. Please try downloading the project brief."
      );
    }
  }

  /* =====================================
     DOWNLOAD BLUEPRINT
  ===================================== */

  function handleDownloadBlueprint() {
    const content = buildBlueprintText();

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cynbit-project-blueprint.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* =====================================
     SUBMIT PROJECT TO BACKEND
  ===================================== */

  async function handleSubmitProject() {
    if (!selectedService || !contactIsValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitProject({
        serviceCategory: selectedService,
        answers,
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim(),
        },
      });

      setSubmissionReference(result.referenceId);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =====================================
     MAIN USER INTERFACE
  ===================================== */

  return (
    <main className="app-shell">

      {/* HEADER */}

      <header className="site-header">
        <a href="/" className="brand" aria-label="Cynbit Blueprint home">
          <span className="brand-symbol">
            <Sparkles size={19} />
          </span>

          <span className="brand-text">
            <strong>cynbit</strong>
            <span>BLUEPRINT</span>
          </span>
        </a>

        <div className="header-note">
          <ShieldCheck size={16} />
          <span>Simple. Structured. Secure.</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}

      <div className="discovery-layout">

        {/* INTRODUCTION PANEL */}

        <section className="intro-panel">
          <div className="intro-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A BETTER WAY TO START YOUR NEXT PROJECT
            </div>

            <h1>
              Let's bring your
              <span> idea to life.</span>
            </h1>

            <p className="intro-description">
              Great projects start with clear requirements.
              Tell us what you're trying to achieve, and we'll help
              turn your vision into a structured project blueprint.
            </p>

            <div className="benefits-list">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="benefit-item" key={benefit.title}>
                    <div className="benefit-icon">
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="intro-footer">
            <div className="footer-line" />
            <p>BUILT FOR BETTER PROJECT CONVERSATIONS</p>
          </div>
        </section>

        {/* WIZARD CARD */}

        <section className="wizard-card">
          <ProgressHeader currentStep={currentStep} />

          {/* =================================
              STEP 1 - SERVICE SELECTION
          ================================= */}

          {currentStep === 1 && (
            <>
              <div className="wizard-heading">
                <div className="step-tag">
                  STEP 01 — SERVICE DISCOVERY
                </div>

                <h2>What are you looking to build?</h2>

                <p>
                  Choose the area that best describes your project.
                  We'll tailor the following questions to your selection.
                </p>
              </div>

              <div className="service-grid">
                {services.map((service) => {
                  const Icon = service.icon;

                  const isSelected =
                    selectedService === service.id;

                  return (
                    <button
                      type="button"
                      key={service.id}
                      className={`service-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => setSelectedService(service.id)}
                      aria-pressed={isSelected}
                    >
                      <div className="service-card-top">
                        <div className="service-icon">
                          <Icon size={23} />
                        </div>

                        <div className="selection-indicator">
                          {isSelected && <Check size={13} />}
                        </div>
                      </div>

                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="wizard-footer">
                <div className="selection-hint">
                  <span
                    className={`hint-dot ${
                      selectedService ? "selected-dot" : ""
                    }`}
                  />

                  <span>
                    {selectedServiceInfo
                      ? `Selected: ${selectedServiceInfo.title}`
                      : "Select an option to continue"}
                  </span>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  disabled={!selectedService}
                  onClick={handleContinue}
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}

          {/* =================================
              STEP 2 - REQUIREMENTS
          ================================= */}

          {currentStep === 2 && (
            <>
              <div className="wizard-heading">
                <div className="step-tag">
                  STEP 02 — PROJECT REQUIREMENTS
                </div>

                <h2>Tell us about your project.</h2>

                <p>
                  A few questions to help us understand your goals
                  and the solution you're looking for.
                </p>
              </div>

              <div className="questionnaire">

                <div className="selected-category">
                  <div className="selected-category-icon">
                    {selectedServiceInfo &&
                      (() => {
                        const Icon = selectedServiceInfo.icon;
                        return <Icon size={21} />;
                      })()}
                  </div>

                  <div>
                    <span>YOUR SELECTED SERVICE</span>
                    <strong>{selectedServiceInfo?.title}</strong>
                  </div>

                  <button
                    type="button"
                    className="change-service"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change
                  </button>
                </div>

                <div className="question-section">
                  <label className="field-label">
                    Where are you currently with this project?
                    <span className="required-mark">*</span>
                  </label>

                  <ChoiceGroup
                    value={answers.projectStage}
                    onChange={(value) =>
                      updateAnswer(
                        "projectStage",
                        value as ProjectStage
                      )
                    }
                    options={[
                      {
                        value: "new-project",
                        label: "New Project",
                        description: "Starting from scratch",
                      },
                      {
                        value: "existing-project",
                        label: "Existing Project",
                        description: "Already have a solution",
                      },
                      {
                        value: "improvement",
                        label: "Improvement",
                        description: "Enhance an existing system",
                      },
                      {
                        value: "exploring",
                        label: "Just Exploring",
                        description: "Evaluating possibilities",
                      },
                    ]}
                  />
                </div>

                <div className="question-section">
                  <label
                    className="field-label"
                    htmlFor="project-description"
                  >
                    What problem are you trying to solve?
                    <span className="required-mark">*</span>
                  </label>

                  <p className="field-help">
                    Describe your idea, business challenge or
                    what you want to achieve.
                  </p>

                  <textarea
                    id="project-description"
                    className="text-input text-area"
                    value={answers.projectDescription}
                    onChange={(event) =>
                      updateAnswer(
                        "projectDescription",
                        event.target.value
                      )
                    }
                    placeholder="Describe your project and the problem you want to solve..."
                    rows={4}
                    maxLength={1500}
                  />

                  <div className="character-count">
                    <span>
                      {answers.projectDescription.length}/1500 characters
                    </span>

                    <span>Minimum 20 characters</span>
                  </div>
                </div>

                <div className="dynamic-questions">
                  <div className="dynamic-section-heading">
                    <span>PERSONALISED QUESTIONS</span>
                    <p>Based on your selected service</p>
                  </div>

                  {renderServiceQuestions()}
                </div>

              </div>

              <div className="wizard-footer questionnaire-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="continue-area">
                  {!canContinue && (
                    <span className="validation-hint">
                      Complete the required fields
                    </span>
                  )}

                  <button
                    type="button"
                    className="primary-button"
                    disabled={!canContinue}
                    onClick={handleNextStep}
                  >
                    Continue
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* =================================
              STEP 3 - TECHNICAL DETAILS
          ================================= */}

          {currentStep === 3 && (
            <>
              <div className="wizard-heading">
                <div className="step-tag">
                  STEP 03 — TECHNICAL DETAILS
                </div>

                <h2>Let's understand your technical needs.</h2>

                <p>
                  Tell us about your technology preferences,
                  integrations and project constraints.
                  You can skip questions you're unsure about.
                </p>
              </div>

              <div className="questionnaire">

                <div className="question-section">
                  <label className="field-label">
                    Do you have preferred technologies or platforms?
                  </label>

                  <p className="field-help">
                    Select all that apply. Optional.
                  </p>

                  <MultiSelectGroup
                    options={getTechnicalOptions()}
                    value={answers.preferredTechnologies}
                    onChange={(value) =>
                      updateAnswer("preferredTechnologies", value)
                    }
                  />
                </div>

                <div className="question-section">
                  <label
                    className="field-label"
                    htmlFor="additional-integrations"
                  >
                    Do you need any third-party integrations?
                  </label>

                  <p className="field-help">
                    Mention APIs, external services or existing tools.
                  </p>

                  <textarea
                    id="additional-integrations"
                    className="text-input text-area"
                    rows={3}
                    maxLength={1000}
                    value={answers.additionalIntegrations}
                    onChange={(event) =>
                      updateAnswer(
                        "additionalIntegrations",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Payment gateways, WhatsApp, CRM..."
                  />
                </div>

                <div className="question-section">
                  <SelectField
                    label="What is your expected project scale?"
                    value={answers.expectedScale}
                    onChange={(value) =>
                      updateAnswer("expectedScale", value)
                    }
                    options={[
                      "Personal / Internal use",
                      "Under 100 users",
                      "100–1,000 users",
                      "1,000–10,000 users",
                      "10,000+ users",
                      "Not sure yet",
                    ]}
                  />
                </div>

                <div className="question-section">
                  <label className="field-label">
                    Are there any specific security requirements?
                  </label>

                  <p className="field-help">
                    Select all that apply.
                  </p>

                  <MultiSelectGroup
                    options={[
                      "User authentication",
                      "Role-based access",
                      "Data privacy",
                      "Payment security",
                      "Regulatory compliance",
                      "Not sure yet",
                    ]}
                    value={answers.securityNeeds}
                    onChange={(value) =>
                      updateAnswer("securityNeeds", value)
                    }
                  />
                </div>

                <div className="question-section">
                  <SelectField
                    label="What is your expected project timeline?"
                    value={answers.timeline}
                    onChange={(value) =>
                      updateAnswer("timeline", value)
                    }
                    options={[
                      "Within 1 month",
                      "1–3 months",
                      "3–6 months",
                      "6+ months",
                      "Flexible / No fixed deadline",
                    ]}
                  />
                </div>

                <div className="question-section">
                  <SelectField
                    label="What is your approximate project budget?"
                    value={answers.budgetRange}
                    onChange={(value) =>
                      updateAnswer("budgetRange", value)
                    }
                    options={[
                      "Under ₹50,000",
                      "₹50,000 – ₹2 lakh",
                      "₹2 lakh – ₹5 lakh",
                      "₹5 lakh – ₹10 lakh",
                      "Above ₹10 lakh",
                      "Not decided yet",
                    ]}
                  />
                </div>

              </div>

              <div className="wizard-footer questionnaire-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setCopied(false);
                    setCurrentStep(4);
                  }}
                >
                  Review Blueprint
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}

          {/* =================================
              STEP 4 - PROJECT BLUEPRINT
          ================================= */}

          {currentStep === 4 && (
            <div className="blueprint-page">

              <div className="blueprint-success">
                <div className="blueprint-success-icon">
                  <Check size={23} />
                </div>

                <div>
                  <span>PROJECT DISCOVERY COMPLETE</span>
                  <h2>Your idea, structured.</h2>
                  <p>
                    Review your project requirements before
                    submitting your enquiry.
                  </p>
                </div>
              </div>

              <div className="blueprint-preview-label">
                <FileText size={17} />
                <span>PROJECT BLUEPRINT PREVIEW</span>
                <span className="preview-badge">DRAFT</span>
              </div>

              {/* Overview */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>01</span>
                  <h3>Project Overview</h3>
                </div>

                <div className="blueprint-overview-grid">
                  <div className="blueprint-stat">
                    <span>SELECTED SERVICE</span>
                    <strong>
                      {selectedServiceInfo?.title}
                    </strong>
                  </div>

                  <div className="blueprint-stat">
                    <span>PROJECT STAGE</span>
                    <strong>{getProjectStageLabel()}</strong>
                  </div>

                  <div className="blueprint-stat">
                    <span>EXPECTED SCALE</span>
                    <strong>
                      {answers.expectedScale || "Not specified"}
                    </strong>
                  </div>

                  <div className="blueprint-stat">
                    <span>EXPECTED TIMELINE</span>
                    <strong>
                      {answers.timeline || "Not specified"}
                    </strong>
                  </div>
                </div>
              </section>

              {/* Business problem */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>02</span>
                  <h3>Business Problem</h3>
                </div>

                <div className="blueprint-description-card">
                  <p>{answers.projectDescription}</p>
                </div>
              </section>

              {/* Functional requirements */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>03</span>
                  <h3>Functional Requirements</h3>
                </div>

                <div className="blueprint-details-list">
                  {getServiceSpecificDetails().length > 0 ? (
                    getServiceSpecificDetails().map((detail) => (
                      <div
                        className="blueprint-detail-row"
                        key={detail.label}
                      >
                        <span>{detail.label}</span>
                        <strong>{detail.value}</strong>
                      </div>
                    ))
                  ) : (
                    <p>No additional details provided.</p>
                  )}
                </div>
              </section>

              {/* Technical details */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>04</span>
                  <h3>Technical Requirements</h3>
                </div>

                <div className="blueprint-details-list">

                  <div className="blueprint-detail-row">
                    <span>Preferred Technologies</span>
                    <strong>
                      {answers.preferredTechnologies.join(", ") ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div className="blueprint-detail-row">
                    <span>Integrations</span>
                    <strong>
                      {answers.additionalIntegrations || "Not specified"}
                    </strong>
                  </div>

                  <div className="blueprint-detail-row">
                    <span>Security Requirements</span>
                    <strong>
                      {answers.securityNeeds.join(", ") || "Not specified"}
                    </strong>
                  </div>

                  <div className="blueprint-detail-row">
                    <span>Approximate Budget</span>
                    <strong>
                      {answers.budgetRange || "Not specified"}
                    </strong>
                  </div>

                </div>
              </section>

              {/* Recommendations */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>05</span>
                  <h3>Initial Technical Considerations</h3>
                </div>

                <div className="recommendation-card">

                  <div className="recommendation-heading">
                    <Sparkles size={18} />
                    <strong>Suggested areas to explore</strong>
                  </div>

                  <p>
                    Initial considerations based on the
                    information provided.
                  </p>

                  <ul>
                    {getTechnicalRecommendations().map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>

                  <span className="recommendation-disclaimer">
                    Preliminary suggestions only, not a confirmed
                    architecture or delivery commitment.
                  </span>

                </div>
              </section>

              {/* Contact details */}

              <section className="blueprint-section">
                <div className="blueprint-section-heading">
                  <span>06</span>
                  <h3>Your Contact Details</h3>
                </div>

                <p className="field-help">
                  Where can the team reach you to discuss this project?
                </p>

                <div className="contact-form-grid">

                  <div className="form-field">
                    <label
                      className="field-label"
                      htmlFor="contact-name"
                    >
                      Full Name
                      <span className="required-mark">*</span>
                    </label>

                    <input
                      id="contact-name"
                      className="text-input"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      placeholder="Enter your full name"
                      value={contact.name}
                      onChange={(event) =>
                        setContact((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label
                      className="field-label"
                      htmlFor="contact-email"
                    >
                      Email Address
                      <span className="required-mark">*</span>
                    </label>

                    <input
                      id="contact-email"
                      className="text-input"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="you@example.com"
                      value={contact.email}
                      onChange={(event) =>
                        setContact((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>

                </div>
              </section>

              {/* Actions */}

              <div className="blueprint-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCurrentStep(3)}
                >
                  <ArrowLeft size={16} />
                  Edit Details
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCopyBlueprint}
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy Summary"}
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleDownloadBlueprint}
                >
                  <Download size={16} />
                  Download Brief
                </button>

              </div>

              {/* Submit panel */}

              <div className="blueprint-submit-panel">

                {!submissionReference ? (
                  <>
                    <h3>Ready to discuss your project?</h3>

                    <p>
                      Submit your project brief to create an enquiry.
                    </p>

                    {submitError && (
                      <p className="submit-error" role="alert">
                        {submitError}
                      </p>
                    )}

                    <button
                      type="button"
                      className="primary-button submit-project-button"
                      disabled={!contactIsValid || isSubmitting}
                      onClick={handleSubmitProject}
                    >
                      <Send size={16} />

                      {isSubmitting
                        ? "Submitting..."
                        : "Submit Project Enquiry"}
                    </button>
                  </>
                ) : (
                  <div className="submission-success" role="status">
                    <Check size={25} />

                    <h3>Project enquiry submitted!</h3>

                    <p>Your project reference number is:</p>

                    <strong>{submissionReference}</strong>

                    <p>
                      Your project details have been successfully saved.
                    </p>
                  </div>
                )}

              </div>

              <p className="blueprint-final-note">
                Your information will be used to process this
                project enquiry. This is an assessment prototype.
              </p>

            </div>
          )}

          {/* CARD FOOTER */}

          <div className="wizard-card-bottom">
            <span>POWERED BY CYNBIT TECHNOLOGIES</span>
            <span>PROJECT DISCOVERY EXPERIENCE</span>
          </div>

        </section>
      </div>

      {/* PAGE FOOTER */}

      <footer className="page-footer">
        <span>© 2026 Cynbit Blueprint · Assessment Prototype</span>
        <span>Designed for better project discovery.</span>
      </footer>

    </main>
  );
}
