export interface AlurkerjaMfeProps {
    form:  {
        setValue: (name: string, value: any) => void;
        register: any;
        control: any;
        watch: any;
        getValues: (name?: string) => any;
    },
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
        
    }
}



export type AlurkerjaInputType = {
    form : {
        setValue: (name: string, value: any) => void;
        register: any;
        control: any;
        watch: any;
        getValues: (name?: string) => any;
    },
    item : InputType;
}

export interface InputType {
    label:           Label;
    name:            string;
    placeholder:     string;
    form_field_type: string;
    ui_type:         string;
    defaultValue:    null;
    tooltip:         Tooltip;
    disabled:        boolean;
    constraints:     Constraints;
    // Add other properties as needed
    [key: string]: any;
}

export interface Constraints {
    required: boolean;
    // Add other constraint properties as needed
    [key: string]: any;
}

export interface Label {
    en: string;
    id: string;
}

export interface Tooltip {
    enable:  boolean;
    message: string;
}

export interface AlurkerjaMfeInputProps {
    props: AlurkerjaInputType;
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
        
    }
}