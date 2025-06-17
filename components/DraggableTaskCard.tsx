import React, { useRef, useState } from 'react';
import { PanResponder, Animated, Dimensions, View, Text, StyleSheet } from 'react-native';
import { TaskCard, TaskCardProps } from './TaskCard';
import { useTheme } from '@/constants/theme';

interface DraggableTaskCardProps extends TaskCardProps {
  onMove: (taskId: string, targetColumnId: string) => void;
  columnId: string;
  columnOrder: number;
  allColumns: Array<{ id: string; order: number; title: string }>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  columnPosition?: { x: number; width: number };
}

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_WIDTH = 300;
const COLUMN_MARGIN = 16;

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onDelete,
  onPress,
  canEdit,
  canDelete,
  onMove,
  columnId,
  columnOrder,
  allColumns,
  onDragStart,
  onDragEnd,
  columnPosition,
}) => {
  const theme = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        console.log('🟢 Drag iniciado para tarefa:', task.title);
        setStartX(gestureState.x0);
        setIsDragging(true);
        setDragDirection(null);
        pan.setValue({ x: 0, y: 0 });
        onDragStart?.();
      },
      onPanResponderMove: (_, gestureState) => {
        console.log('🔄 Movendo:', gestureState.dx, gestureState.dy);
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // Atualizar direção do drag
        if (Math.abs(gestureState.dx) > 20) {
          const newDirection = gestureState.dx > 0 ? 'right' : 'left';
          if (newDirection !== dragDirection) {
            console.log('🔄 Direção do drag:', newDirection, 'dx:', gestureState.dx);
            setDragDirection(newDirection);
          }
        } else {
          setDragDirection(null);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log('🔴 Drag finalizado. Movimento total:', gestureState.dx);
        setIsDragging(false);
        setDragDirection(null);
        pan.flattenOffset();
        onDragEnd?.();

        // Calcular a posição absoluta do movimento
        const totalMovement = gestureState.dx;
        const currentX = startX + totalMovement;
        
        // Determinar a direção do movimento com threshold menor
        if (Math.abs(totalMovement) > 30) { // Threshold reduzido para ser mais responsivo
          const direction = totalMovement > 0 ? 1 : -1;
          const targetColumnOrder = columnOrder + direction;
          
          console.log('📊 Tentando mover para coluna com order:', targetColumnOrder);
          console.log('📋 Colunas disponíveis:', allColumns.map(c => `${c.title} (${c.order})`));
          console.log('📍 Posição atual X:', currentX, 'Movimento:', totalMovement);
          
          // Encontrar a coluna de destino
          const targetColumn = allColumns.find(col => col.order === targetColumnOrder);
          
          // Se encontrou uma coluna válida e diferente da atual
          if (targetColumn && targetColumn.id !== columnId) {
            console.log(`✅ Movendo tarefa "${task.title}" de "${columnId}" para "${targetColumn.id}" (${targetColumn.title})`);
            onMove(task.id, targetColumn.id);
          } else {
            console.log('❌ Coluna de destino não encontrada ou inválida');
            if (targetColumn) {
              console.log('   - Coluna encontrada mas é a mesma:', targetColumn.id === columnId);
            } else {
              console.log('   - Nenhuma coluna com order:', targetColumnOrder);
            }
          }
        } else {
          console.log('❌ Movimento insuficiente para mover tarefa');
        }

        // Animar de volta para a posição original
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      },
      onPanResponderTerminate: () => {
        console.log('🔴 Drag terminado');
        setIsDragging(false);
        setDragDirection(null);
        pan.flattenOffset();
        onDragEnd?.();
        
        // Animar de volta para a posição original
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  return (
    <View style={{ position: 'relative' }}>
      {/* Indicador de direção */}
      {isDragging && dragDirection && (
        <View style={[
          styles.directionIndicator,
          {
            [dragDirection]: 0,
            backgroundColor: theme.colors.primary,
          }
        ]}>
          <Text style={styles.directionText}>
            {dragDirection === 'left' ? '←' : '→'}
          </Text>
        </View>
      )}
      
      {/* Indicador de área de soltura */}
      {isDragging && dragDirection && (
        <View style={[
          styles.dropZoneIndicator,
          {
            [dragDirection]: -COLUMN_WIDTH / 2,
            backgroundColor: theme.colors.primary + '20',
            borderColor: theme.colors.primary,
          }
        ]}>
          <Text style={[styles.dropZoneText, { color: theme.colors.primary }]}>
            Soltar aqui
          </Text>
        </View>
      )}
      
      <Animated.View
        style={[
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: isDragging ? 1.1 : 1 },
            ],
            zIndex: isDragging ? 1000 : 1,
            shadowOpacity: isDragging ? 0.5 : 0.1,
            shadowRadius: isDragging ? 12 : 4,
            elevation: isDragging ? 12 : 3,
            backgroundColor: isDragging ? theme.colors.primary + '10' : 'transparent',
            borderWidth: isDragging ? 2 : 0,
            borderColor: theme.colors.primary,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TaskCard
          task={task}
          onDelete={onDelete}
          onPress={onPress}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  directionIndicator: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  directionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dropZoneIndicator: {
    position: 'absolute',
    top: '50%',
    width: COLUMN_WIDTH,
    height: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  dropZoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
