import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface ArchiveModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  classeName: string;
  isArchiving: boolean;
  loading?: boolean;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  visible,
  onClose,
  onConfirm,
  classeName,
  isArchiving,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isArchiving ? 'Archiver la classe' : 'Désarchiver la classe'}
      confirmText={isArchiving ? 'Archiver' : 'Désarchiver'}
      cancelText="Annuler"
      onConfirm={onConfirm}
      onCancel={onClose}
    >
      <Text style={styles.message}>
        {isArchiving
          ? `Voulez-vous archiver la classe `
          : `Voulez-vous désarchiver la classe `}
        <Text style={styles.bold}>{classeName}</Text> ?
      </Text>
      <Text style={styles.description}>
        {isArchiving
          ? "La classe ne sera plus visible dans la liste principale, mais vous conserverez tout son historique."
          : "La classe redeviendra visible et active dans la liste principale."}
      </Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.light.primary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: typography.weights.bold as any,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
    marginTop: 12,
    lineHeight: 20,
  },
});
