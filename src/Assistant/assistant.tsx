"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Fab, Box, LinearProgress, Typography } from "@mui/material";
import { ThemeProvider, alpha, createTheme, getContrastRatio } from "@mui/material/styles";
import React, { useRef, useState } from "react";
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {AutoAwesome as AutoAwesomeIcon} from '@mui/icons-material';
import {Send as SendIcon} from '@mui/icons-material';
import {Close as CloseIcon} from '@mui/icons-material';
import { AssistantProps, MessageData } from "./types";
import { validateColor, UID } from "./utils";

export const Assistant = (props: AssistantProps): React.ReactElement => {


    const propColorBase = validateColor(props.color);
    const propColorMain = alpha(propColorBase, 1);

    const theme = createTheme({
        palette: {
            propColor: {
                main: propColorMain,
                light: alpha(propColorBase, 0.5),
                dark: alpha(propColorBase, 0.9),
                contrastText: getContrastRatio(propColorMain, "#fff") > 3.0 ? "#fff" : "#111"
            }
        }
    });

    const [isLoading, setLoading] = useState<boolean>(false);
    const [isWaiting, setWaiting] = useState<boolean>(false);

    const [threadId, setThreadId] = useState<string | null>(null);
    const [messageList, setMessageList] = useState<MessageData[]>([]);
    const messageEndRef = useRef<any>(null);

    const [open, setOpen] = useState<boolean>(false);
    const [textValue, setTextValue] = useState<string>('');

    const instructions: string | undefined | null = props.instructions;
    
    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setTextValue('');
        setOpen(false);
    }

    const handleSend = async (message: string) => {
        setLoading(true);
        const messageData: MessageData = {
            id: UID(),
            role: 'user',
            content: message
        }
        setMessageList((prev) => [...prev, ...[messageData]]);
        scrollToMessagesEnd();

        try {
            const response = await fetch(props.apiRoute,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Headers" : "Content-Type",
                        'Access-Control-Allow-Origin':'*',
                        'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'
                    },
                    body: JSON.stringify({
                        thread_id: threadId,
                        message: message,
                        instructions: instructions
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error_message);
            }
            const stream = response.body!;
            const reader = stream.getReader();
            const assistantId = UID();
            const assistantData: MessageData = {
                id: assistantId,
                role: 'assistant',
                content: ''
            }

            setMessageList((prev) => [...prev, ...[assistantData]]);
            setWaiting(true);
            scrollToMessagesEnd();

            let createdThreadId = null;

            while(true) {
                const { done, value } = await reader.read();

                if (done) break;

                const rawDelta = new TextDecoder().decode(value);
                let delta;

                try {
                    delta = JSON.parse(rawDelta);

                    if(typeof delta !== 'object' || delta === null) {
                        throw new Error('Parsed delta JSON is invalid (not an object)');
                    }
                } catch (e) {
                    delta = undefined;
                }
                
                if (delta) {
                    if (delta.thread_id) {
                        createdThreadId = delta.thread_id;
                    } else if (delta.error) {
                        reader.releaseLock();
                        stream.cancel(delta.error);
                        setMessageList((prev) => {
                            return prev.map((data) => {
                                return {
                                    ...data,
                                    content: data.id !== assistantId ? data.content : 'The stream encountered an error. Try asking a different question!'
                                }
                            })
                        })
                        throw new Error(delta.error);
                    } else if (delta.wait) {
                        setWaiting(true);
                        scrollToMessagesEnd();
                    } else if (delta.longwait) {
                        setMessageList((prev) => {
                            return prev.map((data) => {
                                return {
                                    ...data,
                                    content: data.id !== assistantId ? data.content : data.content+'\n\n'
                                }
                            })
                        });
                        setWaiting(true);
                        scrollToMessagesEnd();
                    }
                } else {
                    setWaiting(false);
                    setMessageList((prev) => {
                        return prev.map((data) => {
                            return {
                                ...data,
                                content: data.id !== assistantId ? data.content : data.content + rawDelta
                            }
                        })
                    })
                    scrollToMessagesEnd();
                }
            }

            setThreadId(createdThreadId);
        } catch (e) {
            console.error(e);
        } finally {
            setWaiting(false);
            setLoading(false);
            scrollToMessagesEnd();
        }
    }

    const scrollToMessagesEnd = () => {
        messageEndRef.current?.scrollIntoView(true, {behavior: "smooth"});
    }

    return (
        <ThemeProvider theme={theme}>
            <Fab 
                color="propColor"
                variant={props.FabProps?.variant ?? "extended"}
                onClick={handleClickOpen}
                sx={{
                    height: props.FabProps?.height ?? 73,
                    width: props.FabProps?.width ?? 73,
                    borderRadius: props.FabProps?.variant==='circular' ? undefined : (props.FabProps?.borderRadius ?? '0.3rem'),
                    position: "fixed",
                    right: props.FabProps?.right ?? 35,
                    bottom: props.FabProps?.bottom ?? 35,
                    zIndex: props.FabProps?.zIndex ?? "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    fontSize: props.FabProps?.fontSize ?? ".8rem",
                    padding: 0
                }}
            >
                {props.icon ?? <AutoAwesomeIcon fontSize={props.iconSize ?? "large"}/>}
                {props.buttonLabel ?? 'ASK AI'}
            </Fab>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={props.ModalProps?.maxWidth ?? 'md'}
                sx={{
                    zIndex: props.ModalProps?.zIndex ?? 2
                }}
                fullWidth
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const message: string = formJson.message;
                        setTextValue('');
                        handleSend(message);
                    }
                }}
            >
                <DialogTitle 
                    variant={props.ModalProps?.titleVariant ?? "h5"} 
                    sx={{
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: "center", 
                        backgroundColor: 'rgb(241, 243, 245)', 
                        borderBottom: '.1rem solid #0000001a' 
                    }}
                >
                    {props.icon ?? <AutoAwesomeIcon />}
                    <strong style={{marginLeft: ".5rem"}}>
                        {props.title}
                    </strong>
                    <IconButton 
                        onClick={handleClose}
                        sx={{marginLeft: "auto"}}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{paddingTop: 2}}>
                        {messageList.length === 0 && <em>{props.placeholder}</em>}
                        {messageList.map((m, index) => (
                            <div key={index}>
                                <div>
                                    {
                                        m.role === 'user' ? 
                                        (
                                            <Typography 
                                                variant="h5" 
                                                marginBottom={1}
                                            >
                                                <strong>{m.content}</strong>
                                            </Typography>
                                        ) : (
                                            <div style={{marginBottom: 15}}>
                                                <Markdown
                                                    components={{
                                                        code({node, className, children, ...props}) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return match ? (
                                                                <SyntaxHighlighter
                                                                    children={String(children).replace(/\n$/, '')}
                                                                    style={atomDark}
                                                                    language={match[1]} 
                                                                    PreTag="div"
                                                                    wrapLines={true}
                                                                    wrapLongLines={true}
                                                                />
                                                            ) : (
                                                                <code 
                                                                    style={{
                                                                        backgroundColor: "rgb(248, 249, 250)", 
                                                                        color: "rgb(26, 27, 30)", 
                                                                        padding: "0.125rem calc(0.3125rem)", 
                                                                        borderRadius: "0.25rem",
                                                                        border: ".1rem solid #0000001a"
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {m.content}
                                                </Markdown>
                                            </div>
                                        ) 
                                    }
                                </div>
                                { (index === messageList.length-1 && isWaiting) && <LinearProgress color="propColor"/> }
                            </div>
                        ))}
                        <div ref={messageEndRef}></div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <TextField
                        color="propColor"
                        autoFocus
                        required
                        margin="normal"
                        id="chat-modal"
                        name="message"
                        label={props.formLabel ?? "Ask me a question..."}
                        InputLabelProps={{ required: false }}
                        type="message"
                        value={textValue}
                        onChange={(event) => {setTextValue(event.target.value)}}
                        fullWidth
                        variant="outlined"
                        disabled={isLoading}
                        // multiline
                        // maxRows={2}
                        sx={{marginTop: "8px"}}
                        InputProps={{
                            sx: { padding: '10px'},
                            endAdornment: (<Button color="propColor" type="submit" disabled={isLoading} sx={{ minWidth: "fit-content"}}><SendIcon /></Button>),
                        }}
                        inputProps={{
                            sx: { padding: '10px'}
                        }}
                    />
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}