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
      highlight: 'bg-blue-100 border-b-2 border-blue-400',
      tooltip: 'bg-blue-50 border-blue-200',
      button: 'text-blue-600 hover:text-blue-800'
    },
    warning: {
      highlight: 'bg-yellow-100 border-b-2 border-yellow-400',
      tooltip: 'bg-yellow-50 border-yellow-200',
      button: 'text-yellow-600 hover:text-yellow-800'
    },
    positive: {
      highlight: 'bg-green-100 border-b-2 border-green-400',
      tooltip: 'bg-green-50 border-green-200',
      button: 'text-green-600 hover:text-green-800'
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
          className={`z-50 p-3 rounded-lg shadow-lg border ${styles.tooltip} max-w-xs`}
        >
          <FloatingArrow ref={arrowRef} context={context} className="fill-current" />
          <div className="space-y-2">
            <p className="text-sm text-gray-700">{feedback.suggestion}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  onDismiss();
                  setIsOpen(false);
                }}
                className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
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