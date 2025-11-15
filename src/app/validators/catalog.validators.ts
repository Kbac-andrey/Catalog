import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function forbiddenCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const forbiddenChars = /[<>{}[\]]/;
    const hasForbiddenChars = forbiddenChars.test(control.value);

    return hasForbiddenChars ? { forbiddenCharacters: { value: control.value } } : null;
  };
}

export function duplicateTagValidator(tagsArray: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !tagsArray) {
      return null;
    }

    const trimmedValue = control.value.trim().toLowerCase();
    if (!trimmedValue) {
      return null;
    }

    const tags = tagsArray.value as string[];
    const formArray = tagsArray as any;
    const controls = formArray.controls || [];
    
    // Find the index of the current control
    const currentIndex = controls.findIndex((c: AbstractControl) => c === control);
    
    // Check if any other tag (excluding current) matches
    const isDuplicate = tags.some((tag, index) => {
      if (index === currentIndex) {
        return false;
      }
      return tag.trim().toLowerCase() === trimmedValue;
    });

    return isDuplicate ? { duplicateTag: { value: control.value } } : null;
  };
}

