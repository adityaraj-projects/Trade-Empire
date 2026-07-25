import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

type ModalCloseHandler = () => void;

interface ModalEntry {
  id: string;
  handler: ModalCloseHandler;
}

class HardwareBackManager {
  private modalStack: ModalEntry[] = [];

  registerModal(id: string, handler: ModalCloseHandler) {
    // Prevent duplicates
    this.modalStack = this.modalStack.filter((m) => m.id !== id);
    this.modalStack.push({ id, handler });
    // Push dummy history entry to capture hardware back button
    window.history.pushState({ modalId: id }, '');
  }

  unregisterModal(id: string) {
    this.modalStack = this.modalStack.filter((m) => m.id !== id);
  }

  handleBack(): boolean {
    if (this.modalStack.length > 0) {
      const top = this.modalStack.pop();
      if (top) {
        top.handler();
        return true;
      }
    }
    return false;
  }
}

export const backManager = new HardwareBackManager();

export function useHardwareBack(modalId?: string, isOpen?: boolean, onClose?: ModalCloseHandler) {
  useEffect(() => {
    if (modalId && isOpen && onClose) {
      backManager.registerModal(modalId, onClose);
      return () => {
        backManager.unregisterModal(modalId);
      };
    }
  }, [modalId, isOpen, onClose]);
}
