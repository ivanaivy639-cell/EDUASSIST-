import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ClasseFilters, ClasseSort, Niveau } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { NIVEAUX, SORT_OPTIONS } from '../../utils/constants';

interface ClasseFilterProps {
  filters: ClasseFilters;
  sort: ClasseSort;
  onFilterChange: (filters: ClasseFilters) => void;
  onSortChange: (sort: ClasseSort) => void;
}

export const ClasseFilter: React.FC<ClasseFilterProps> = ({
  filters,
  sort,
  onFilterChange,
  onSortChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Filtre par niveau */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.niveauScroll}
      >
        {NIVEAUX.map((niveau) => (
          <TouchableOpacity
            key={niveau.value}
            style={[
              styles.filterChip,
              filters.niveau === niveau.value && styles.filterChipActive,
            ]}
            onPress={() => onFilterChange({
              ...filters,
              niveau: (filters.niveau === niveau.value ? 'tous' : niveau.value) as Niveau | 'tous',
            })}
          >
            <Text style={[
              styles.filterChipText,
              filters.niveau === niveau.value && styles.filterChipTextActive,
            ]}>
              {niveau.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
      >
        {SORT_OPTIONS.map((option) => {
          const [sortBy, sortOrder] = option.value === 'created_at_asc'
            ? ['created_at', 'asc']
            : [option.value, 'desc'];
          const isActive = sort.sort_by === sortBy && sort.sort_order === sortOrder;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortChip,
                isActive && styles.sortChipActive,
              ]}
              onPress={() => onSortChange({ sort_by: sortBy as any, sort_order: sortOrder as any })}
            >
              <Text style={[
                styles.sortChipText,
                isActive && styles.sortChipTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  niveauScroll: {
    maxHeight: 44,
  },
  sortScroll: {
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.borders.light,
    marginRight: spacing[2],
    backgroundColor: colors.bg.cardLight,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
  },
  sortChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray[100],
    marginRight: spacing[2],
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text.light.secondary,
  },
  sortChipTextActive: {
    color: colors.text.light.inverse,
    fontWeight: typography.weights.medium as any,
  },
});
