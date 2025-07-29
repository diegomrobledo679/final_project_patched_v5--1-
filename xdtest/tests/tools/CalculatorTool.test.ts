
import { executeCalculatorTool } from '@/tools/CalculatorTool';

describe('CalculatorTool', () => {
  it('should add two numbers correctly', async () => {
    const result = await executeCalculatorTool({ operation: 'add', num1: 5, num2: 3 });
    expect(result).toBe('8');
  });

  it('should subtract two numbers correctly', async () => {
    const result = await executeCalculatorTool({ operation: 'subtract', num1: 5, num2: 3 });
    expect(result).toBe('2');
  });

  it('should multiply two numbers correctly', async () => {
    const result = await executeCalculatorTool({ operation: 'multiply', num1: 5, num2: 3 });
    expect(result).toBe('15');
  });

  it('should divide two numbers correctly', async () => {
    const result = await executeCalculatorTool({ operation: 'divide', num1: 6, num2: 3 });
    expect(result).toBe('2');
  });

  it('should handle division by zero', async () => {
    const result = await executeCalculatorTool({ operation: 'divide', num1: 5, num2: 0 });
    expect(result).toBe('Error: Division by zero.');
  });
});
