import {Transformer} from "./Transformer"

export default function generateStyle(context: Transformer) {
    return `
        [data-testid="platform-card.common.ui.custom-fields.custom-card-field-list"] {
            display: none !important;
        }
        
        .logist-avatar-container {
            width: 9px; 
            height: 24px; 
            position: relative; 
            margin-top: 2px;
        }
        
        ${context.storyContentSelector} .logist-avatar-container + div:not(.logist-avatar-container) {
            margin-left: 3px;
        }
        
        .logist-avatar-24, 
        ${context.kanbanItemSelector} [data-vc="avatar-image"],
        ${context.storyContentSelector} [data-vc="avatar-image"],
        ${context.kanbanItemSelector} [data-vc="issue-field-assignee.common.ui.read-view.popover.avatar--image"] {
            min-width: 24px;
            min-height: 24px;
            max-width: 24px;
            max-height: 24px;
            border-radius: 50%;
            position: absolute;
            border: 2px solid ${context.backgroundColor};
            background-color: ${context.color};
            box-sizing: border-box;
        }
        
        ${context.kanbanItemSelector} [data-vc="avatar-image"], 
        ${context.storyContentSelector} [data-vc="avatar-image"], 
        ${context.kanbanItemSelector} [data-vc="issue-field-assignee.common.ui.read-view.popover.avatar--image"] {
            margin-top: 2px;
        }
        
        .logist-avatar-container:after {
            content: attr(data-name);
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            width: 16px;
            height: 16px;
            left: 3px;
            top: -11px;
            color: ${context.color};
            font-size: 12px;
            border-radius: 50%;
        }
        
        ${context.storyContentSelector} .logist-avatar-container:after {
            left: 8px;
        }
        
        
        /* Скопировано из jira */
        .logist-button {
            align-items: baseline;
            border-width: 0px;
            border-radius: var(--ds-border-radius, 3px);
            box-sizing: border-box;
            display: inline-flex;
            font-weight: 500;
            max-width: 100%;
            position: relative;
            text-align: center;
            text-decoration: none;
            transition: background 0.1s ease-out, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38);
            white-space: nowrap;
            background: var(--ds-background-brand-bold, #0052CC);
            cursor: pointer;
            height: 2.28571em;
            line-height: 2.28571em;
            padding: 0px 10px;
            vertical-align: middle;
            width: auto;
            justify-content: center;
            color: var(--ds-text-inverse, #FFFFFF) !important;
        }
        
        .logist-button span {
            font-weight: 500;
            text-align: center;
            cursor: pointer;
            line-height: 2.28571em;
            color: var(--ds-text-inverse, #FFFFFF) !important;
            opacity: 1;
            transition: opacity 0.3s;
            margin: 0 2px;
            -webkit-box-flex: 1;
            flex-grow: 1;
            flex-shrink: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        /* Скопировано из jira */
        
        
        .logist-selector {
            display: inline-flex;
            margin-top: .5rem;
        }
        
        .logist-selector > span {
            font-size: 12px;
            margin-left: .5rem;
        }
        
        .logist-switch {
            position: relative;
            width: 40px;
            height: 20px;
        }
        
        .logist-switch input {
            display: none;
        }
        
        .logist-label {
            display: block;
            width: 100%;
            height: 100%;
            background-color: #ccc;
            border-radius: 20px;
            cursor: pointer;
            position: relative;
            transition: background-color .25s ease;
        }
        
        .logist-inner {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background-color: #fff;
            border-radius: 50%;
            transition: transform .15s ease;
        }
        
        input:checked + .logist-label {
            background-color: #4caf50;
        }
        
        input:checked + .logist-label .logist-inner {
            transform: translateX(20px);
        }
    `
}