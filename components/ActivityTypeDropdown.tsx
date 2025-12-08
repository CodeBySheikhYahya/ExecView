import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ActivityTabType = 'Recharge' | 'Redeem' | 'Transfer' | 'Reset Password' | 'New Account';

interface ActivityTypeDropdownProps {
  selectedTab: ActivityTabType;
  onTabChange: (tab: ActivityTabType) => void;
}

export default function ActivityTypeDropdown({
  selectedTab,
  onTabChange,
}: ActivityTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tabs: ActivityTabType[] = ['Recharge', 'Redeem', 'Transfer', 'Reset Password', 'New Account'];

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}>
        <ThemedText style={styles.dropdownButtonText}>{selectedTab}</ThemedText>
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
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.dropdownItem,
                      selectedTab === tab && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onTabChange(tab);
                      setIsOpen(false);
                    }}>
                    <ThemedText
                      style={[
                        styles.dropdownItemText,
                        selectedTab === tab && styles.dropdownItemTextSelected,
                      ]}>
                      {tab}
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
    minWidth: 150,
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

