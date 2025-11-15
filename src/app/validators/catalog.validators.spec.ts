import { AbstractControl, FormArray, FormControl, ValidationErrors } from '@angular/forms';
import { forbiddenCharactersValidator, duplicateTagValidator } from './catalog.validators';

describe('catalog.validators', () => {
  describe('forbiddenCharactersValidator', () => {
    it('should return null for empty value', () => {
      const validator = forbiddenCharactersValidator();
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for valid text without forbidden characters', () => {
      const validator = forbiddenCharactersValidator();
      const control = new FormControl('Valid text with numbers 123');
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return error for text containing < character', () => {
      const validator = forbiddenCharactersValidator();
      const control = new FormControl('Text with < forbidden');
      const result = validator(control);
      expect(result).toEqual({ forbiddenCharacters: { value: 'Text with < forbidden' } });
    });

    it('should return error for text containing > character', () => {
      const validator = forbiddenCharactersValidator();
      const control = new FormControl('Text with > forbidden');
      const result = validator(control);
      expect(result).toEqual({ forbiddenCharacters: { value: 'Text with > forbidden' } });
    });

    it('should return error for text containing { } [ ] characters', () => {
      const validator = forbiddenCharactersValidator();
      const control1 = new FormControl('Text with {forbidden}');
      const control2 = new FormControl('Text with [forbidden]');
      expect(validator(control1)).toEqual({ forbiddenCharacters: { value: 'Text with {forbidden}' } });
      expect(validator(control2)).toEqual({ forbiddenCharacters: { value: 'Text with [forbidden]' } });
    });
  });

  describe('duplicateTagValidator', () => {
    it('should return null for empty value', () => {
      const tagsArray = new FormArray([new FormControl('tag1')]);
      const validator = duplicateTagValidator(tagsArray);
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for unique tag', () => {
      const tagsArray = new FormArray([
        new FormControl('tag1'),
        new FormControl('tag2')
      ]);
      const validator = duplicateTagValidator(tagsArray);
      const control = new FormControl('tag3');
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return error for duplicate tag (case-insensitive)', () => {
      const tagsArray = new FormArray([
        new FormControl('tag1'),
        new FormControl('TAG2')
      ]);
      const validator = duplicateTagValidator(tagsArray);
      const control = new FormControl('tag2');
      const result = validator(control);
      expect(result).toEqual({ duplicateTag: { value: 'tag2' } });
    });

    it('should return null when comparing tag with itself and handle trimmed values', () => {
      const tagsArray = new FormArray([
        new FormControl('tag1'),
        new FormControl('tag2')
      ]);
      const validator = duplicateTagValidator(tagsArray);
      const control = tagsArray.controls[1] as FormControl;
      expect(validator(control)).toBeNull();
      
      // Test trimmed values
      const tagsArray2 = new FormArray([
        new FormControl('tag1'),
        new FormControl('  tag2  ')
      ]);
      const validator2 = duplicateTagValidator(tagsArray2);
      const control2 = new FormControl('tag2');
      expect(validator2(control2)).toEqual({ duplicateTag: { value: 'tag2' } });
    });
  });
});

