import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface EntDropdownProps {
  ents: string[];
  selectedEnt: string;
  onEntChange: (ent: string) => void;
}

export default function EntDropdown({ ents, selectedEnt, onEntChange }: EntDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}>
        <ThemedText style={styles.dropdownButtonText}>{selectedEnt}</ThemedText>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <ThemedView style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ThemedView style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.listContent}>
                  {ents.map((ent, idx) => (
                    <TouchableOpacity
                      key={ent}
                      style={[
                        styles.dropdownItem,
                        idx === 0 && styles.firstItem,
                        idx === ents.length - 1 && styles.lastItem,
                        selectedEnt === ent && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        onEntChange(ent);
                        setIsOpen(false);
                      }}>
                      <ThemedText
                        style={[
                          styles.dropdownItemText,
                          selectedEnt === ent && styles.dropdownItemTextSelected,
                        ]}>
                        {ent}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsOpen(false)}>
                    <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </TouchableWithoutFeedback>
          </ThemedView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 8,
    maxHeight: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  listContent: {
    paddingBottom: 12,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  firstItem: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  lastItem: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: '#2563eb',
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});


