var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { executeCalculatorTool } from '@/tools/CalculatorTool';
describe('CalculatorTool', () => {
    it('should add two numbers correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield executeCalculatorTool({ operation: 'add', num1: 5, num2: 3 });
        expect(result).toBe('8');
    }));
    it('should subtract two numbers correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield executeCalculatorTool({ operation: 'subtract', num1: 5, num2: 3 });
        expect(result).toBe('2');
    }));
    it('should multiply two numbers correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield executeCalculatorTool({ operation: 'multiply', num1: 5, num2: 3 });
        expect(result).toBe('15');
    }));
    it('should divide two numbers correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield executeCalculatorTool({ operation: 'divide', num1: 6, num2: 3 });
        expect(result).toBe('2');
    }));
    it('should handle division by zero', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield executeCalculatorTool({ operation: 'divide', num1: 5, num2: 0 });
        expect(result).toBe('Error: Division by zero.');
    }));
});
