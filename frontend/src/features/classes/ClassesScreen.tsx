import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

import { Classe, ClasseFormData, ClasseFilters, ClasseSort } from '../../types';
import { useClasses } from '../../hooks/useClasses';
import { useCreateClasse } from '../../hooks/useCreateClasse';
import { useUpdateClasse } from '../../hooks/useUpdateClasse';
import { useDeleteClasse } from '../../hooks/useDeleteClasse';
import { useArchiveClasse } from '../../hooks/useArchiveClasse';
import { useSearch } from '../../hooks/useSearch';

import { ClasseList } from '../../components/classes/ClasseList';
import { ClasseFilter } from '../../components/classes/ClasseFilter';
import { ClasseForm } from '../../components/classes/ClasseForm';
import { DeleteModal } from '../../components/classes/DeleteModal';
import { ArchiveModal } from '../../components/classes/ArchiveModal';
import { SearchBar } from '../../components/common/SearchBar';

export const ClassesScreen: React.FC = () => {
  const [filters, setFilters] = useState<ClasseFilters>({});
  const [sort, setSort] = useState<ClasseSort>({ sort_by: 'created_at', sort_order: 'desc' });
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [isArchiving, setIsArchiving] = useState(true);

  // Hooks
  const { classes, loading, error, loadMore, refresh } = useClasses(filters);
  const { createClasse, loading: creating } = useCreateClasse();
  const { updateClasse, loading: updating } = useUpdateClasse();
  const { deleteClasse } = useDeleteClasse();
  const { archiveClasse, unarchiveClasse } = useArchiveClasse();
  const { query: searchQuery, handleSearch } = useSearch(300);

  // Sync search with filters
  const handleSearchChange = useCallback(
    (text: string) => {
      handleSearch(text);
      setFilters(prev => ({ ...prev, search: text || undefined }));
    },
    [handleSearch]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // ── Form (Create / Edit) ────────────────────────────────────────────
  const handleOpenCreate = () => {
    setSelectedClasse(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (classe: Classe) => {
    setSelectedClasse(classe);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: ClasseFormData) => {
    if (selectedClasse) {
      const updated = await updateClasse(selectedClasse.id, data);
      if (updated) {
        setShowFormModal(false);
        refresh();
      }
    } else {
      const created = await createClasse(data);
      if (created) {
        setShowFormModal(false);
        refresh();
      }
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleOpenDelete = (classe: Classe) => {
    setSelectedClasse(classe);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClasse) return;
    const success = await deleteClasse(selectedClasse.id);
    if (success) {
      setShowDeleteModal(false);
      refresh();
    }
  };

  // ── Archive ─────────────────────────────────────────────────────────
  const handleOpenArchive = (classe: Classe) => {
    setSelectedClasse(classe);
    setIsArchiving(classe.est_active);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    if (!selectedClasse) return;
    const result = isArchiving
      ? await archiveClasse(selectedClasse.id)
      : await unarchiveClasse(selectedClasse.id);
    if (result) {
      setShowArchiveModal(false);
      refresh();
    }
  };

  // ── Navigation placeholders ─────────────────────────────────────────
  const handleViewClasse = (classe: Classe) => {
    // TODO: navigate to ClasseDetailScreen
    console.log('Voir classe:', classe.nom);
  };
  const handleViewStudents = (classe: Classe) => console.log('Élèves de:', classe.nom);
  const handleViewCourses = (classe: Classe) => console.log('Cours de:', classe.nom);
  const handleViewGrades = (classe: Classe) => console.log('Notes de:', classe.nom);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mes Classes</Text>
          <Text style={styles.headerSubtitle}>
            {classes.length} classe{classes.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Rechercher une classe..."
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ClasseFilter
          filters={filters}
          sort={sort}
          onFilterChange={setFilters}
          onSortChange={setSort}
        />
      </View>

      {/* List */}
      <ClasseList
        classes={classes}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLoadMore={loadMore}
        onViewClasse={handleViewClasse}
        onEditClasse={handleOpenEdit}
        onDeleteClasse={handleOpenDelete}
        onArchiveClasse={handleOpenArchive}
        onViewStudents={handleViewStudents}
        onViewCourses={handleViewCourses}
        onViewGrades={handleViewGrades}
      />

      {/* Form Modal (Create / Edit) */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFormModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedClasse ? 'Modifier la classe' : 'Nouvelle classe'}
            </Text>
            <TouchableOpacity onPress={() => setShowFormModal(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ClasseForm
            initialData={selectedClasse || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowFormModal(false)}
            loading={creating || updating}
          />
        </SafeAreaView>
      </Modal>

      {/* Delete Modal */}
      <DeleteModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        onArchive={() => {
          setShowDeleteModal(false);
          if (selectedClasse) handleOpenArchive(selectedClasse);
        }}
        classeName={selectedClasse?.nom || ''}
      />

      {/* Archive Modal */}
      <ArchiveModal
        visible={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleConfirmArchive}
        classeName={selectedClasse?.nom || ''}
        isArchiving={isArchiving}
      />
    </SafeAreaView>
  );
};

ClassesScreen.displayName = 'ClassesScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
