import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Classe } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../common/Card';

interface ClasseCardProps {
  classe: Classe;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onViewStudents: () => void;
  onViewCourses: () => void;
  onViewGrades: () => void;
}

export const ClasseCard: React.FC<ClasseCardProps> = ({
  classe,
  onPress,
  onEdit,
  onDelete,
  onArchive,
  onViewStudents,
  onViewCourses,
  onViewGrades,
}) => {
  const isActive = classe.est_active;

  return (
    <Card style={styles.card} onPress={onPress}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getNiveauColor(classe.niveau) }]}>
            <Text style={styles.iconText}>{classe.nom.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.title}>{classe.nom}</Text>
            <Text style={styles.subtitle}>{classe.niveau}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          isActive ? styles.statusActive : styles.statusArchived
        ]}>
          <Text style={[
            styles.statusText,
            isActive ? styles.statusTextActive : styles.statusTextArchived
          ]}>
            {isActive ? 'Active' : 'Archivée'}
          </Text>
        </View>
      </View>

      {/* Informations */}
      <View style={styles.infoContainer}>
        <InfoItem icon="people-outline" value={`${classe.nombre_eleves} élèves`} />
        <InfoItem icon="book-outline" value={`${classe.nombre_matieres} matières`} />
        <InfoItem icon="calendar-outline" value={classe.annee_scolaire} />
      </View>

      {/* Matières */}
      {classe.matieres && classe.matieres.length > 0 && (
        <View style={styles.matieresContainer}>
          {classe.matieres.slice(0, 3).map((matiere) => (
            <View
              key={matiere.id}
              style={[styles.matiereBadge, { backgroundColor: matiere.couleur + '20' }]}
            >
              <View style={[styles.matiereDot, { backgroundColor: matiere.couleur }]} />
              <Text style={[styles.matiereText, { color: matiere.couleur }]}>
                {matiere.nom}
              </Text>
            </View>
          ))}
          {classe.matieres.length > 3 && (
            <Text style={styles.moreMatieres}>+{classe.matieres.length - 3}</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <ActionButton icon="eye-outline" label="Voir" onPress={onPress} />
        <ActionButton icon="create-outline" label="Modifier" onPress={onEdit} />
        <ActionButton icon="people-outline" label="Élèves" onPress={onViewStudents} />
        <ActionButton icon="library-outline" label="Cours" onPress={onViewCourses} />
        <ActionButton icon="bar-chart-outline" label="Notes" onPress={onViewGrades} />
        <ActionButton
          icon={isActive ? "archive-outline" : "refresh-outline"}
          label={isActive ? "Archiver" : "Désarchiver"}
          onPress={onArchive}
        />
        <ActionButton icon="trash-outline" label="Supprimer" onPress={onDelete} danger />
      </View>
    </Card>
  );
};

const InfoItem: React.FC<{ icon: string; value: string }> = ({ icon, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as any} size={16} color={colors.gray[500]} />
    <Text style={styles.infoText}>{value}</Text>
  </View>
);

const ActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}> = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons
      name={icon as any}
      size={18}
      color={danger ? colors.danger[500] : colors.gray[600]}
    />
    <Text style={[
      styles.actionLabel,
      danger && styles.actionLabelDanger
    ]}>{label}</Text>
  </TouchableOpacity>
);

function getNiveauColor(niveau: string): string {
  const niveauColors: Record<string, string> = {
    '6e': '#F59E0B',
    '5e': '#10B981',
    '4e': '#3B82F6',
    '3e': '#8B5CF6',
    'Seconde': '#EC4899',
    'Premiere': '#6366F1',
    'Terminale': '#EF4444',
  };
  return niveauColors[niveau] || colors.primary;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  iconText: {
    color: colors.text.light.inverse,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text.light.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.muted,
    marginTop: spacing[0.5],
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  statusActive: {
    backgroundColor: colors.secondary[100],
  },
  statusArchived: {
    backgroundColor: colors.gray[200],
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
  },
  statusTextActive: {
    color: colors.secondary[700],
  },
  statusTextArchived: {
    color: colors.gray[600],
  },
  infoContainer: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
  },
  matieresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  matiereBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
    gap: spacing[1.5],
  },
  matiereDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  matiereText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium as any,
  },
  moreMatieres: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.muted,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.borders.light,
    paddingTop: spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
  },
  actionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
  actionLabelDanger: {
    color: colors.danger[500],
  },
});
