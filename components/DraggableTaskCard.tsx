
import React from 'react';
import { Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/task';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

interface Props {
  task: Task;
  columnId: string;
  columns: { id: string }[];
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  onDelete: () => void;
}

export const DraggableTaskCard: React.FC<Props> = ({
  task,
  columnId,
  columns,
  moveTask,
  onDelete,
}) => {
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      const toColumnId = columns.find((col, index) => {
        const colX = index * (COLUMN_WIDTH + 20);
        return event.absoluteX > colX && event.absoluteX < colX + COLUMN_WIDTH;
      })?.id;

      if (toColumnId && toColumnId !== columnId) {
        runOnJS(moveTask)(task.id, columnId, toColumnId);
      }
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View>
        <TaskCard task={task} onPress={() => {}} onDelete={onDelete} />
      </Animated.View>
    </PanGestureHandler>
  );
};
