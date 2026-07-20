import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Classe } from '../../types';
import { ClasseCard } from './ClasseCard';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ClasseListProps {
  classes: Classe[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewClasse: (classe: Classe) => void;
  onEditClasse: (classe: Classe) => void;
  onDeleteClasse: (classe: Classe) => void;
  onArchiveClasse: (classe: Classe) => void;
  onViewStudents: (classe: Classe) => void;
  onViewCourses: (classe: Classe) => void;
  onViewGrades: (classe: Classe) => void;
}

export const ClasseList: React.FC<ClasseListProps> = ({
  classes,
  loading,
  error,
  refreshing,
  onRefresh,
  onLoadMore,
  onViewClasse,
  onEditClasse,
  onDeleteClasse,
  onArchiveClasse,
  onViewStudents,
  onViewCourses,
  onViewGrades,
}) => {
  if (loading && classes.length === 0) {
    return <LoadingState message="Chargement des classes..." />;
  }

  if (error && classes.length === 0) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon="school-outline"
        title="Aucune classe"
        description="Créez votre première classe en appuyant sur le bouton +"
      />
    );
  }

  return (
    <FlatList
      data={classes}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ClasseCard
          classe={item}
          onPress={() => onViewClasse(item)}
          onEdit={() => onEditClasse(item)}
          onDelete={() => onDeleteClasse(item)}
          onArchive={() => onArchiveClasse(item)}
          onViewStudents={() => onViewStudents(item)}
          onViewCourses={() => onViewCourses(item)}
          onViewGrades={() => onViewGrades(item)}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
    gap: spacing[4],
  },
});
