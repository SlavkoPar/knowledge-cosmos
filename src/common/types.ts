import { IDateAndBy } from 'global/types'

export type OptionValue = string | number;

export type IOption<T extends OptionValue> = {
    value: T;
    label: string;
    color?: string;
    checked?: boolean;
};

export type ICreatedModifiedProps = { 
    created?: IDateAndBy, 
    createdBy?: string,
    modified?: IDateAndBy,
    modifiedBy?: string
    classes?: string 
  }
