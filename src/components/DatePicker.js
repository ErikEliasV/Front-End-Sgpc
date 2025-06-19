import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const DatePicker = ({ 
  label, 
  value, 
  onDateChange, 
  placeholder = 'Selecione uma data',
  required = false,
  minimumDate = null,
  maximumDate = null,
  style = {}
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      onDateChange(formatDateForAPI(selectedDate), selectedDate);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <TouchableOpacity style={styles.dateButton} onPress={openPicker}>
        <View style={styles.dateButtonContent}>
          <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
          <Text style={[styles.dateText, !value && styles.placeholderText]}>
            {value ? formatDate(new Date(value + 'T00:00:00')) : placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#8E8E93" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale="pt-BR"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
    minHeight: 48,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  placeholderText: {
    color: '#8E8E93',
  },
});

export default DatePicker; 