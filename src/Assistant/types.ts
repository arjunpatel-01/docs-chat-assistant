declare module "@mui/material/styles" {
    interface Palette {
        propColor: Palette["primary"];
    }

    interface PaletteOptions {
        propColor?: PaletteOptions["primary"];
    }
}

declare module "@mui/material/Fab" {
    interface FabPropsColorOverrides {
        propColor: true;
    }
}

declare module "@mui/material/TextField" {
    interface TextFieldPropsColorOverrides {
        propColor: true;
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        propColor: true;
    }
}

declare module "@mui/material/LinearProgress" {
    interface LinearProgressPropsColorOverrides {
        propColor: true;
    }
}

/**
 * Model for user and assistant message data.
 */
export type MessageData = {
    id: string,
    role: string,
    content: string
}

type Variant =  "body1" | "body2" | 
                "caption" | 
                "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | 
                "subtitle1" | "subtitle2" ;

interface FabDefaultProps {
    /**
     * Height of FAB.
     * @default
     * 73
     */
    height?: string | number,
    /**
     * Width of FAB.
     * @default
     * 73
     */
    width?: string | number,
    /**
     * Horizontal spacing of FAB from the right edge.
     * @default
     * 35
     */
    right?: string | number,
    /**
     * Vertical spacing of FAB from the bottom edge.
     * @default
     * 35
     */
    bottom?: string | number,
    /**
     * z-order of FAB.
     * @default
     * 1
     */
    zIndex?: (string & {}) | (number & {}),
    /**
     * Font size of FAB text.
     * @default
     * '.8rem'
     */
    fontSize?: string | number
}

interface FabCircularProps {
    /**
     * Shape variant of FAB.
     * 
     * If set to 'circular', the borderRadius prop will be disabled.
     * @default
     * 'extended'
     */
    variant?: 'circular',
    /**
     * Border curvature of FAB.
     * 
     * Disabled if variant is set to 'circular'.
     * @default
     * '0.3rem' or undefined
     */
    borderRadius?: never
}

interface FabExtendedProps {
    /**
     * Shape variant of FAB.
     * 
     * If set to 'circular', the borderRadius prop will be disabled.
     * @default
     * 'extended'
     */
    variant?: 'extended',
    /**
     * Border curvature of FAB.
     * 
     * Disabled if variant is set to 'circular'.
     * @default
     * '.3rem' or undefined
     */
    borderRadius?: string | number
}

interface ModalProps {
    /**
     * Determine the max-width of the modal. 
     * The modal width grows with the size of the screen.
     * Uses {@link https://mui.com/material-ui/react-dialog/ MUI Dialog}.
     * @default
     * 'md'
     */
    maxWidth?: "sm" | "md" | "lg",
    /**
     * Applies {@link https://mui.com/material-ui/api/typography Typography} variant theme to Modal title.
     * Supports 'body1' | 'body2' | 'caption' | 
                'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 
                'subtitle1' | 'subtitle2'.
        @default
        'h5'
     */
    titleVariant?: Variant,
    /**
     * z-order of Modal.
     * @default
     * 2
     */
    zIndex?: (string & {}) | (number & {}),
}

export interface AssistantProps {
    /**
     * The color of the component. 
     * Affects the Floating Action Button, textfield, and send icon.
     * 
     * Supports {@link https://mui.com/material-ui/api/button/ MUI Button color prop } ("info" | "success" | "error" | "warning"),
     * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/named-color CSS Standard Colors},
     * RGB string,
     * and Hex code.
     * @default
     * 'info'
    */
    color?: string
    /**
     * Props to modify the Floating Action Button element.
     * @default
     * {}
     * @see https://github.com/arjunpatel-01/docs-chat-assistant/?tab=readme-ov-file#fabprops
     */
    FabProps?: FabDefaultProps & (FabCircularProps | FabExtendedProps),
    /**
     * Insert React JSX ELement to override default FAB icon.
     * @default
     * AutoAwesomeIcon
     * @see https://mui.com/material-ui/material-icons/?query=aw&selected=AutoAwesome
     */
    icon?: React.JSX.Element,
    /**
     * The size of FAB default icon. 
     * If icon prop is overridden, this prop will not affect React JSX Element size.
     * @default
     * 'large'
     */
    iconSize?: "small" | "medium" | "large",
    /**
     * The label on the FAB.
     * @default
     * 'Ask AI'
     */
    buttonLabel?: string,
    /**
     * Props to modify the popup Modal element.
     * Uses {@link https://mui.com/material-ui/react-dialog/ MUI Dialog}
     * @default
     * {}
     * @see https://github.com/arjunpatel-01/docs-chat-assistant/?tab=readme-ov-file#modalprops
     */
    ModalProps?: ModalProps,
    /**
     * Title for Chat Assistant interface. This is a mandatory prop.
     */
    title: string,
    /**
     * The placeholder text before the user has sent the first message.
     * 
     * Temporarily fills the space where the messages will be displayed 
     * and is replaced with message log once the first one is sent.
     * @default
     * ''
     */
    placeholder?: string
    /**
     * The label in the TextField.
     * @default
     * 'Ask me a question...'
     */
    formLabel?: string,
    /**
     * Additional instructions for OpenAI assistant to follow.
     * 
     * Recommended but not mandatory as long as Assistant instructions have been set
     * in the {@link https://platform.openai.com/assistants/ OpenAI API Assisants dashboard}.
     * @default
     * undefined
     */
    instructions?: string
    /**
     * API route for the Assistant. This is a mandatory prop.
     * 
     * @tutorial https://github.com/arjunpatel-01/docs-chat-assistant/?tab=readme-ov-file#assistant-api
     */
    apiRoute: string,
}