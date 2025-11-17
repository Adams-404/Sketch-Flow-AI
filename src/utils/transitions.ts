
/**
 * Custom transition animations for the application
 */

export interface TransitionStyles {
  entering: React.CSSProperties;
  entered: React.CSSProperties;
  exiting: React.CSSProperties;
  exited: React.CSSProperties;
}

export const fadeTransition: TransitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1, transition: 'opacity 300ms ease-out' },
  exiting: { opacity: 0, transition: 'opacity 300ms ease-out' },
  exited: { opacity: 0 },
};

export const slideUpTransition: TransitionStyles = {
  entering: { opacity: 0, transform: 'translateY(10px)' },
  entered: { 
    opacity: 1, 
    transform: 'translateY(0)', 
    transition: 'opacity 400ms ease-out, transform 400ms ease-out' 
  },
  exiting: { 
    opacity: 0, 
    transform: 'translateY(10px)', 
    transition: 'opacity 400ms ease-out, transform 400ms ease-out' 
  },
  exited: { opacity: 0, transform: 'translateY(10px)' },
};

export const scaleTransition: TransitionStyles = {
  entering: { opacity: 0, transform: 'scale(0.95)' },
  entered: { 
    opacity: 1, 
    transform: 'scale(1)', 
    transition: 'opacity 300ms ease-out, transform 300ms ease-out' 
  },
  exiting: { 
    opacity: 0, 
    transform: 'scale(0.95)', 
    transition: 'opacity 300ms ease-out, transform 300ms ease-out' 
  },
  exited: { opacity: 0, transform: 'scale(0.95)' },
};

export const blurTransition: TransitionStyles = {
  entering: { opacity: 0, filter: 'blur(5px)' },
  entered: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), filter 400ms cubic-bezier(0.16, 1, 0.3, 1)' 
  },
  exiting: { 
    opacity: 0, 
    filter: 'blur(5px)', 
    transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), filter 400ms cubic-bezier(0.16, 1, 0.3, 1)' 
  },
  exited: { opacity: 0, filter: 'blur(5px)' },
};
