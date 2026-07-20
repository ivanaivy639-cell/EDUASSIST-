import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onArchive: () => void;
  classeName: string;
  loading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onArchive,
  classeName,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Supprimer la classe"
      confirmText="Supprimer"
      cancelText="Annuler"
      onConfirm={onConfirm}
      onCancel={onClose}
      danger
    >
      <Text style={styles.message}>
        Êtes-vous certain de vouloir supprimer <Text style={styles.bold}>{classeName}</Text> ?
      </Text>
      <Text style={styles.warning}>
        Cette opération supprimera également toutes les données liées (élèves, cours, devoirs, notes...).
      </Text>
      <Text style={styles.archiveSuggestion}>
        💡 L'archivage est recommandé pour conserver l'historique.
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
  warning: {
    fontSize: typography.sizes.sm,
    color: colors.danger[600],
    marginTop: 12,
    lineHeight: 20,
  },
  archiveSuggestion: {
    fontSize: typography.sizes.sm,
    color: colors.warn[600],
    marginTop: 12,
    fontStyle: 'italic',
  },
});
