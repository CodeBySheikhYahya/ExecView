import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
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
        activeOpacity={0.7}>
        <ThemedText style={styles.dropdownButtonText}>{selectedEnt}</ThemedText>
        <ThemedText style={styles.arrow}>▼</ThemedText>
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
                {ents.map((ent) => (
                  <TouchableOpacity
                    key={ent}
                    style={[
                      styles.dropdownItem,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: 120,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 200,
    maxHeight: 400,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#1976d2',
  },
});

