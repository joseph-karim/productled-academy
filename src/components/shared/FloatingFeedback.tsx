import React from 'react';
import {
  useFloating,
  useInteractions,
  useHover,
  offset,
  flip,
  shift,
  arrow,
  FloatingArrow,
} from '@floating-ui/react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface Feedback {
  id: string;
  text: string;
  suggestion: string;
  type: 'improvement' | 'warning' | 'positive';
  startIndex: number;
  endIndex: number;
}

interface FloatingFeedbackProps {
  feedback: Feedback;
  onAccept: () => void;
  onDismiss: () => void;
}

export function FloatingFeedback({ feedback, onAccept, onDismiss }: FloatingFeedbackProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const arrowRef = React.useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(10),
      flip(),
      shift(),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { delay: { open: 100 } });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const typeStyles = {
    improvement: {
      highlight: 'bg-[#2A2A2A] border-b-2 border-[#FFD23F]',
      tooltip: 'bg-[#2A2A2A] border-[#FFD23F]',
      button: 'text-[#FFD23F] hover:text-[#FFD23F]/80'
    },
    warning: {
      highlight: 'bg-[#2A2A2A] border-b-2 border-amber-500',
      tooltip: 'bg-[#2A2A2A] border-amber-500',
      button: 'text-amber-500 hover:text-amber-400'
    },
    positive: {
      highlight: 'bg-[#2A2A2A] border-b-2 border-green-500',
      tooltip: 'bg-[#2A2A2A] border-green-500',
      button: 'text-green-500 hover:text-green-400'
    }
  };

  const styles = typeStyles[feedback.type];

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`cursor-help ${styles.highlight}`}
      >
        {feedback.text}
      </span>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={`z-50 p-3 rounded-lg shadow-lg border ${styles.tooltip} max-w-xs text-white`}
        >
          <FloatingArrow ref={arrowRef} context={context} className="fill-current" />
          <div className="space-y-2">
            <p className="text-sm">{feedback.suggestion}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  onDismiss();
                  setIsOpen(false);
                }}
                className="flex items-center px-2 py-1 text-xs text-gray-400 hover:text-gray-300"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Dismiss
              </button>
              <button
                onClick={() => {
                  onAccept();
                  setIsOpen(false);
                }}
                className={`flex items-center px-2 py-1 text-xs ${styles.button}`}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}