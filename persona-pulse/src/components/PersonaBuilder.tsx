'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Generation, generationColors } from '@/lib/personas';
import { 
  saveCustomPersona, 
  updateCustomPersona,
  createBlankPersona,
  CustomPersona 
} from '@/lib/custom-personas';
import { 
  User, 
  Brain, 
  MessageSquare, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Save,
  Sparkles,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PersonaBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (persona: CustomPersona) => void;
  editPersona?: CustomPersona | null;
}

type Step = 'import' | 'basic' | 'psychology' | 'communication' | 'preview';

const STEPS: Step[] = ['import', 'basic', 'psychology', 'communication', 'preview'];

const STEP_TITLES: Record<Step, string> = {
  import: 'Import',
  basic: 'Basic Info',
  psychology: 'Psychology Profile',
  communication: 'Communication Protocol',
  preview: 'Preview & Save',
};

const STEP_ICONS: Record<Step, React.ReactNode> = {
  import: <Upload className="h-4 w-4" />,
  basic: <User className="h-4 w-4" />,
  psychology: <Brain className="h-4 w-4" />,
  communication: <MessageSquare className="h-4 w-4" />,
  preview: <Eye className="h-4 w-4" />,
};

const SUPPORTED_FILE_TYPES = [
  '.pptx',
  '.docx', 
  '.pdf',
  '.txt',
];

interface MissingField {
  field: string;
  question: string;
  answer: string;
}

const GENERATIONS: Generation[] = ['Gen Z', 'Gen Y', 'Gen X', 'Boomer'];

const AVATAR_PRESETS = [
  '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🔬', '👨‍🔬', 
  '👩‍🏫', '👨‍🏫', '👩‍⚕️', '👨‍⚕️', '🧑‍💼', '🧑‍💻'
];

export function PersonaBuilder({ open, onClose, onSave, editPersona }: PersonaBuilderProps) {
  const [currentStep, setCurrentStep] = useState<Step>('import');
  const [formData, setFormData] = useState(() => 
    editPersona ? { ...editPersona } : createBlankPersona()
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>(editPersona?.customAvatar || '👩‍💼');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [isAskingQuestions, setIsAskingQuestions] = useState(false);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setExtractionError(null);
    setIsExtracting(true);
    setMissingFields([]);

    try {
      // Create form data for upload
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      // Extract text and parse persona
      const response = await fetch('/api/extract-persona', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract persona');
      }

      const result = await response.json();
      
      // Update form with extracted data
      if (result.persona) {
        setFormData(prev => ({
          ...prev,
          ...result.persona,
          psychology: {
            ...prev.psychology,
            ...result.persona.psychology,
          },
          communication: {
            ...prev.communication,
            ...result.persona.communication,
          },
        }));
      }

      // Set missing fields for follow-up questions
      if (result.missingFields && result.missingFields.length > 0) {
        setMissingFields(result.missingFields.map((f: { field: string; question: string }) => ({
          ...f,
          answer: '',
        })));
        setIsAskingQuestions(true);
      } else {
        // All fields extracted, go to basic info
        setCurrentStep('basic');
      }
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Failed to extract persona');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle answering missing field questions
  const handleAnswerQuestion = (index: number, answer: string) => {
    setMissingFields(prev => prev.map((f, i) => 
      i === index ? { ...f, answer } : f
    ));
  };

  // Submit answers and continue
  const handleSubmitAnswers = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/complete-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPersona: formData,
          answers: missingFields,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete persona');
      }

      const result = await response.json();
      
      if (result.persona) {
        setFormData(prev => ({
          ...prev,
          ...result.persona,
          psychology: {
            ...prev.psychology,
            ...result.persona.psychology,
          },
          communication: {
            ...prev.communication,
            ...result.persona.communication,
          },
        }));
      }

      setIsAskingQuestions(false);
      setMissingFields([]);
      setCurrentStep('basic');
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Failed to complete persona');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleSave = () => {
    const personaData = {
      ...formData,
      customAvatar: selectedAvatar,
      imageQuery: formData.name,
    };

    let savedPersona: CustomPersona;
    
    if (editPersona) {
      savedPersona = updateCustomPersona(editPersona.id, personaData) as CustomPersona;
    } else {
      savedPersona = saveCustomPersona(personaData);
    }

    onSave(savedPersona);
    handleClose();
  };

  const handleClose = () => {
    setFormData(createBlankPersona());
    setCurrentStep('import');
    setSelectedAvatar('👩‍💼');
    setUploadedFile(null);
    setExtractionError(null);
    setMissingFields([]);
    setIsAskingQuestions(false);
    onClose();
  };

  // Skip import and start from scratch
  const handleSkipImport = () => {
    setCurrentStep('basic');
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        psychology: {
          ...prev.psychology,
          painPoints: [...prev.psychology.painPoints, newPainPoint.trim()],
        },
      }));
      setNewPainPoint('');
    }
  };

  const removePainPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      psychology: {
        ...prev.psychology,
        painPoints: prev.psychology.painPoints.filter((_, i) => i !== index),
      },
    }));
  };

  const addDo = () => {
    if (newDo.trim()) {
      setFormData(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          do: [...prev.communication.do, newDo.trim()],
        },
      }));
      setNewDo('');
    }
  };

  const removeDo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        do: prev.communication.do.filter((_, i) => i !== index),
      },
    }));
  };

  const addDont = () => {
    if (newDont.trim()) {
      setFormData(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          dont: [...prev.communication.dont, newDont.trim()],
        },
      }));
      setNewDont('');
    }
  };

  const removeDont = (index: number) => {
    setFormData(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        dont: prev.communication.dont.filter((_, i) => i !== index),
      },
    }));
  };

  const isBasicValid = formData.name.trim() && formData.role.trim();

  const colors = generationColors[formData.generation];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {editPersona ? 'Edit Persona' : 'Create Custom Persona'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  step === currentStep
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : index < currentStepIndex
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}
              >
                {STEP_ICONS[step]}
                <span className="text-sm font-medium hidden sm:inline">{STEP_TITLES[step]}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  index < currentStepIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {/* Step 0: Import */}
          {currentStep === 'import' && (
            <div className="space-y-6">
              {/* File Upload Area */}
              {!isAskingQuestions && (
                <>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      uploadedFile
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={SUPPORTED_FILE_TYPES.join(',')}
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    
                    {isExtracting ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Extracting persona information...
                        </p>
                        <p className="text-sm text-gray-500">
                          AI is analyzing your file
                        </p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 text-green-500" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to choose a different file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          Drop a file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports: PowerPoint, Word, PDF, Text files
                        </p>
                      </div>
                    )}
                  </div>

                  {extractionError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{extractionError}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">or</p>
                    <Button variant="outline" onClick={handleSkipImport}>
                      Start from scratch
                    </Button>
                  </div>
                </>
              )}

              {/* Follow-up Questions */}
              {isAskingQuestions && missingFields.length > 0 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Just a few more details...
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Help us complete the persona with these quick questions
                    </p>
                  </div>

                  {missingFields.map((field, index) => (
                    <div key={field.field} className="space-y-2">
                      <Label>{field.question}</Label>
                      <Textarea
                        value={field.answer}
                        onChange={(e) => handleAnswerQuestion(index, e.target.value)}
                        placeholder="Type your answer..."
                        rows={2}
                      />
                    </div>
                  ))}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAskingQuestions(false);
                        setCurrentStep('basic');
                      }}
                      className="flex-1"
                    >
                      Skip & Edit Manually
                    </Button>
                    <Button
                      onClick={handleSubmitAnswers}
                      disabled={isExtracting}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-teal-500"
                    >
                      {isExtracting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Complete Persona
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="space-y-4">
              {/* Avatar Selection */}
              <div>
                <Label>Avatar</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVATAR_PRESETS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sarah"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title/Nickname</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., The Strategic Thinker"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Product Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., New York"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tenure">Tenure</Label>
                  <Input
                    id="tenure"
                    value={formData.tenure}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenure: e.target.value }))}
                    placeholder="e.g., 5 Years"
                  />
                </div>
                <div>
                  <Label>Generation</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {GENERATIONS.map((gen) => (
                      <button
                        key={gen}
                        onClick={() => setFormData(prev => ({ ...prev, generation: gen }))}
                        className={`px-2 py-1 text-xs rounded-full transition-all ${
                          formData.generation === gen
                            ? `${generationColors[gen].badge} text-white`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="quote">Signature Quote</Label>
                <Input
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="e.g., Data drives decisions, not opinions."
                />
              </div>
            </div>
          )}

          {/* Step 2: Psychology Profile */}
          {currentStep === 'psychology' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="stress">Stress Triggers</Label>
                <Textarea
                  id="stress"
                  value={formData.psychology.stress}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    psychology: { ...prev.psychology, stress: e.target.value }
                  }))}
                  placeholder="What causes stress for this persona?"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="motivation">Motivation</Label>
                <Textarea
                  id="motivation"
                  value={formData.psychology.motivation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    psychology: { ...prev.psychology, motivation: e.target.value }
                  }))}
                  placeholder="What drives and motivates this persona?"
                  rows={2}
                />
              </div>

              <div>
                <Label>Pain Points</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newPainPoint}
                    onChange={(e) => setNewPainPoint(e.target.value)}
                    placeholder="Add a pain point"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
                  />
                  <Button onClick={addPainPoint} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.psychology.painPoints.map((point, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {point}
                      <button onClick={() => removePainPoint(i)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Communication Protocol */}
          {currentStep === 'communication' && (
            <div className="space-y-4">
              <div>
                <Label className="text-green-600">Do&apos;s - What works well</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newDo}
                    onChange={(e) => setNewDo(e.target.value)}
                    placeholder="Add a communication tip"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDo())}
                  />
                  <Button onClick={addDo} size="icon" variant="outline" className="text-green-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.communication.do.map((item, i) => (
                    <Badge key={i} className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {item}
                      <button onClick={() => removeDo(i)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-red-600">Don&apos;ts - What to avoid</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newDont}
                    onChange={(e) => setNewDont(e.target.value)}
                    placeholder="Add something to avoid"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDont())}
                  />
                  <Button onClick={addDont} size="icon" variant="outline" className="text-red-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.communication.dont.map((item, i) => (
                    <Badge key={i} className="gap-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {item}
                      <button onClick={() => removeDont(i)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              {/* Preview Card */}
              <div className={`rounded-xl overflow-hidden border-2 ${colors.border}`}>
                <div className={`${colors.bg} p-6`}>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedAvatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{formData.name || 'Unnamed'}</h3>
                        <Badge className={`${colors.badge} text-white`}>{formData.generation}</Badge>
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      </div>
                      <p className={`${colors.text} font-medium`}>{formData.title || 'No title'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.role || 'No role'} • {formData.location || 'No location'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {formData.quote && (
                    <p className="italic text-gray-600 dark:text-gray-400">
                      &ldquo;{formData.quote}&rdquo;
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Age</p>
                      <p className="text-gray-600 dark:text-gray-400">{formData.age}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Tenure</p>
                      <p className="text-gray-600 dark:text-gray-400">{formData.tenure || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="font-medium mb-1">Psychology</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formData.psychology.painPoints.length} pain points defined
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="font-medium mb-1">Communication</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formData.communication.do.length} do&apos;s, {formData.communication.dont.length} don&apos;ts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation - Hidden on import step */}
        {currentStep !== 'import' && (
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'basic'}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStepIndex} of {STEPS.length - 1}
            </div>

            {isLastStep ? (
              <Button
                onClick={handleSave}
                disabled={!isBasicValid}
                className="gap-1 bg-gradient-to-r from-purple-500 to-teal-500"
              >
                <Save className="h-4 w-4" />
                {editPersona ? 'Save Changes' : 'Create Persona'}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

