declare global {
    interface Window {
        AJS: any
    }

    type DataJson = Record<string, unknown>
    type CustomSearchElementResult = HTMLElement | Element | null | undefined

    type DataBoardPeople = {
        active: boolean
        avatarUrl: string
        displayName: string
        userKey: string
    }
    type DataBoardPeopleJson = {
        [displayName: string]: DataBoardPeople
    }

    type DataBoardColumnJson = {
        id: number
        issues: CustomJiraIssue[]
        name: string
    }

    type DataBoard = {
        people: DataBoardPeopleJson
        columns: DataBoardColumnJson[]
    }

    type CustomFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    type CustomFetchResult = DataJson | DataBoard | string | null
    type CustomFetchInterceptingOptions = {
        before?: (input: RequestInfo | URL, init?: RequestInit) => {input: RequestInfo | URL, init?: RequestInit}
        after?: (dataJson: CustomFetchResult) => void
    }
    type CustomFetchIntercepting = {
        [url: string]: CustomFetchInterceptingOptions
    }

    type CustomTransformerCustomField = {
        name?: string
        shortname: string
    }
    type CustomTransformerCustomFields = {
        [id: number | string]: CustomTransformerCustomField
    }
    type CustomTransformerConfigOptions = {
        historyType: string
        customFields: CustomTransformerCustomFields
    }

    type CustomJiraCardExtraField = {
        id: string
        label: string
        text: string
    }
    type CustomJiraIssue = {
        id: number
        key: string
        cardExtraFields: CustomJiraCardExtraField[]
        issueTypeId: string,
    }
    type CustomJiraIssues = Record<string, CustomJiraIssue>

    type CustomSetting = {
        toggled: boolean
        description: string
    }
    type CustomSettings = Record<string, CustomSetting>
}

export {}