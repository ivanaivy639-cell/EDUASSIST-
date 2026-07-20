import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClasseFormData, Niveau, Classe, Matiere } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { validateClasseForm, getErrorByField } from '../../utils/validators';

interface ClasseFormProps {
  initialData?: Classe;
  onSubmit: (data: ClasseFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const NIVEAUX: { value: Niveau; label: string }[] = [
  { value: '6e', label: '6e' },
  { value: '5e', label: '5e' },
  { value: '4e', label: '4e' },
  { value: '3e', label: '3e' },
  { value: 'Seconde', label: 'Seconde' },
  { value: 'Premiere', label: 'Première' },
  { value: 'Terminale', label: 'Terminale' },
];

const ANNEES_SCOLAIRES = ['2023-2024', '2024-2025', '2025-2026'];

const MATIERES_DISPONIBLES: Matiere[] = [
  { id: 1, nom: 'Mathématiques', code: 'MATH', couleur: '#EF4444' },
  { id: 2, nom: 'Physique-Chimie', code: 'PC', couleur: '#3B82F6' },
  { id: 3, nom: 'SVT', code: 'SVT', couleur: '#10B981' },
  { id: 4, nom: 'Histoire-Géographie', code: 'HG', couleur: '#F59E0B' },
  { id: 5, nom: 'Français', code: 'FR', couleur: '#8B5CF6' },
  { id: 6, nom: 'Anglais', code: 'AN', couleur: '#EC4899' },
  { id: 7, nom: 'Philosophie', code: 'PHILO', couleur: '#6366F1' },
];

export const ClasseForm: React.FC<ClasseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ClasseFormData>({
    nom: '',
    niveau: '6e',
    section: '',
    serie: '',
    description: '',
    annee_scolaire: '2024-2025',
    statut: 'active',
    matieres: [],
  });
  const [errors, setErrors] = useState<any[]>([]);
  const [showMatieres, setShowMatieres] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom,
        niveau: initialData.niveau,
        section: initialData.section || '',
        serie: initialData.serie || '',
        description: initialData.description || '',
        annee_scolaire: initialData.annee_scolaire,
        statut: initialData.statut,
        matieres: initialData.matieres?.map(m => ({ id: m.id })) || [],
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof ClasseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const toggleMatiere = (matiereId: number) => {
    const exists = formData.matieres?.some(m => m.id === matiereId);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        matieres: prev.matieres?.filter(m => m.id !== matiereId) || [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        matieres: [...(prev.matieres || []), { id: matiereId }],
      }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateClasseForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section Informations */}
      <Text style={styles.sectionTitle}>Informations générales</Text>
      
      <Input
        label="Nom de la classe *"
        value={formData.nom}
        onChangeText={(text) => handleChange('nom', text)}
        placeholder="Ex: Terminale S1"
        error={getErrorByField(errors, 'nom')}
      />

      {/* Niveau */}
      <Text style={styles.label}>Niveau *</Text>
      <View style={styles.niveauGrid}>
        {NIVEAUX.map((niveau) => (
          <TouchableOpacity
            key={niveau.value}
            style={[
              styles.niveauButton,
              formData.niveau === niveau.value && styles.niveauButtonActive,
            ]}
            onPress={() => handleChange('niveau', niveau.value)}
          >
            <Text style={[
              styles.niveauText,
              formData.niveau === niveau.value && styles.niveauTextActive,
            ]}>
              {niveau.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Section"
        value={formData.section}
        onChangeText={(text) => handleChange('section', text)}
        placeholder="Ex: S, ES, L..."
      />

      <Input
        label="Série"
        value={formData.serie}
        onChangeText={(text) => handleChange('serie', text)}
        placeholder="Ex: Scientifique"
      />

      <Input
        label="Année scolaire *"
        value={formData.annee_scolaire}
        onChangeText={(text) => handleChange('annee_scolaire', text)}
        placeholder="2024-2025"
        error={getErrorByField(errors, 'annee_scolaire')}
      />

      <Input
        label="Description"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        placeholder="Description de la classe..."
        multiline
        numberOfLines={4}
        style={styles.textArea}
        error={getErrorByField(errors, 'description')}
      />

      {/* Section Matières */}
      <TouchableOpacity
        style={styles.matieresHeader}
        onPress={() => setShowMatieres(!showMatieres)}
      >
        <Text style={styles.sectionTitle}>Matières enseignées</Text>
        <Ionicons
          name={showMatieres ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.gray[500]}
        />
      </TouchableOpacity>

      {showMatieres && (
        <View style={styles.matieresGrid}>
          {MATIERES_DISPONIBLES.map((matiere) => {
            const isSelected = formData.matieres?.some(m => m.id === matiere.id);
            return (
              <TouchableOpacity
                key={matiere.id}
                style={[
                  styles.matiereButton,
                  isSelected && { borderColor: matiere.couleur, backgroundColor: matiere.couleur + '15' },
                ]}
                onPress={() => toggleMatiere(matiere.id)}
              >
                <View style={[styles.matiereDot, { backgroundColor: matiere.couleur }]} />
                <Text style={[
                  styles.matiereButtonText,
                  isSelected && { color: matiere.couleur, fontWeight: '600' },
                ]}>
                  {matiere.nom}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color={matiere.couleur} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Boutons */}
      <View style={styles.actions}>
        <Button
          title="Annuler"
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button
          title={initialData ? 'Mettre à jour' : 'Créer la classe'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text.light.primary,
    marginBottom: spacing[4],
    marginTop: spacing[4],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text.light.secondary,
    marginBottom: spacing[2],
  },
  niveauGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  niveauButton: {
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.borders.light,
    backgroundColor: colors.bg.inputLight,
  },
  niveauButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  niveauText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
  },
  niveauTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  matieresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  matieresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  matiereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.borders.light,
    backgroundColor: colors.bg.inputLight,
  },
  matiereDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  matiereButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[8],
    marginBottom: spacing[6],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
