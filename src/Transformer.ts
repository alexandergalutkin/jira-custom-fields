import {FetchInterceptor} from "./FetchInterceptor"
import generateStyle from "./style"

export class Transformer {
    private readonly customFields: CustomTransformerCustomFields
    private readonly itemSelector: string
    private readonly avatarContainerSelector: string
    private readonly avatarWrapperSelector: string
    private readonly storySelector: string
    private readonly historyType: string
    readonly kanbanItemSelector: string
    readonly storyContentSelector: string

    private users!: DataBoardPeopleJson
    private issues!: CustomJiraIssues
    private dataJson!: DataBoard
    private settings!: CustomSettings

    private intercepting!: CustomFetchIntercepting
    private fetchInterceptor!: FetchInterceptor

    backgroundColor!: string
    color!: string

    constructor(configOptions: CustomTransformerConfigOptions) {
        console.log('Transformer - init')

        this.itemSelector = '[data-testid="platform-card.common.ui.custom-fields.card-custom-field.html-card-custom-field-content.html-field"]'
        this.kanbanItemSelector = '[data-testid="software-board.board-container.board.card-container.card-with-icc"]'
        this.avatarContainerSelector = '[data-testid="software-board.board-container.board.card-container.card.assignee-field.button"]'
        this.avatarWrapperSelector = '[data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper"]'

        this.storySelector = '[data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper"]'
        this.storyContentSelector = '[data-testid="platform-board-kit.ui.swimlane.swimlane-content"]'

        this.historyType = configOptions.historyType
        this.customFields = configOptions.customFields

        this.checkboxChangeHandler = this.checkboxChangeHandler.bind(this)
    }

    public async init(): Promise<void> {
        this.initIntercepting()

        unsafeWindow.addEventListener('DOMContentLoaded', (): void => {
            this.callSettingsModal()
        })

        unsafeWindow.addEventListener('load', (): void => {
            this.appendStyles()
        })

        unsafeWindow.addEventListener('keydown', (event: KeyboardEvent): void => {
            if (!event.altKey) {
                return
            }

            switch (event.code) {
                case 'KeyA':
                    event.preventDefault()
                    this.openSettingsModal()
                    break
            }
        })
    }

    private callSettingsModal(): void {
        try {
            const storage: string = unsafeWindow.localStorage.getItem('logist-settings') ?? ''
            this.settings = JSON.parse(storage)
        } catch (e) {
            this.settings = this.firstInitialize()
            this.saveSettings()
        }
    }

    private firstInitialize(): CustomSettings {
        unsafeWindow.AJS.flag({
            type: 'info',
            title: 'Первый запуск скрипта',
            body: `
                <p>Скрипт инициализирован успешно</p>
                <p>Если вы хотите настроить его (например выключить отображение букв роли над аватарками или отключить их самих), то нажмите следующее сочетание клавиш:</p>
                <p class="logist-button">
                    <span>ALT + A</span>
                </p>
            `,
            close: 'manual'
        })

        return {
            toggleRoleNameUnderIcon: {
                toggled: true,
                description: 'Краткое название ролей'
            },
            toggleStoriesAvatars: {
                toggled: true,
                description: 'Показывать аватары возле сториков'
            },
            toggleCardAvatars: {
                toggled: true,
                description: 'Показывать аватары в карточках'
            },
        }
    }

    private saveSettings(): void {
        unsafeWindow.localStorage.setItem('logist-settings', JSON.stringify(this.settings))
    }

    private openSettingsModal(): void {
        let formattedSettings: string[] = [
            '<p>Изменения вступят в силу после обновления страницы (или просто полистать вверх-вниз, пока контент не перерисуется)</p>'
        ]

        for (let setting in this.settings) {
            formattedSettings.push(`
                <div class="logist-selector" data-selector-id="${setting}">
                    <div class="logist-switch">
                        <input type="checkbox" id="${setting}" ${this.settings[setting].toggled ? 'checked' : ''}/>
                        <label for="${setting}" class="logist-label">
                            <span class="logist-inner"></span>
                        </label>
                    </div>
                    <span>${this.settings[setting].description}</span>
                </div>
            `)
        }

        unsafeWindow.AJS.flag({
            type: 'info',
            title: 'Настройки',
            body: formattedSettings.join(''),
            close: 'manual'
        })

        document.querySelectorAll('.logist-selector input[type="checkbox"]')
            .forEach((item: Element): void => {
                item.addEventListener('change', this.checkboxChangeHandler)
            })
    }

    checkboxChangeHandler(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement
        const selector: HTMLElement | null = target.closest('.logist-selector')
        if (!selector) {
            return
        }

        const selectorId: string | undefined = selector.dataset.selectorId
        if (!selectorId) {
            return
        }

        this.settings[selectorId].toggled = target.checked
        this.saveSettings()
    }

    reduceBoardHandler(acc: DataBoardPeopleJson, person: DataBoardPeople): DataBoardPeopleJson {
        acc[person.displayName] = person
        return acc
    }

    reduceColumnHandler(acc: CustomJiraIssues, column: DataBoardColumnJson): CustomJiraIssues {
        acc = {
            ...acc,
            ...column.issues.reduce<CustomJiraIssues>(function (acc: CustomJiraIssues, issue: CustomJiraIssue) {
                acc[issue.key] = issue
                return acc
            }, {})
        }

        return acc
    }

    private initIntercepting(): void {
        this.intercepting = {
            '/rest/boards/latest/board/1': {
                before: (input: RequestInfo | URL, init?: RequestInit) => {
                    const [url, paramsString]: string[] = (input as string).split('?')
                    if (typeof paramsString === 'undefined') {
                        return {input, init}
                    }

                    const params: URLSearchParams = new URLSearchParams(paramsString)
                    if (params.get('hideCardExtraFields')) {
                        params.delete('hideCardExtraFields')
                    }

                    return {input: `${url}?${params.toString()}`, init}
                },
                after: (dataJson: CustomFetchResult): void => {
                    this.dataJson = (dataJson as DataBoard)
                    this.users = Object.values(this.dataJson.people)
                        .reduce<DataBoardPeopleJson>(this.reduceBoardHandler, {})

                    this.issues = Object.values(this.dataJson.columns)
                        .reduce<CustomJiraIssues>(this.reduceColumnHandler, {})

                    setTimeout(() => {
                        this.initMutator()
                        this.transformPage()
                    })
                }
            }
        }

        this.fetchInterceptor = new FetchInterceptor(this.intercepting)
    }

    private async transformPage(): Promise<void> {
        if (this.settings.toggleCardAvatars.toggled) {
            const items = document.querySelectorAll(this.itemSelector)
            items.forEach((item: Element) => this.transformItem(item as HTMLElement))
        }

        if (this.settings.toggleStoriesAvatars.toggled) {
            const stories = document.querySelectorAll(this.storySelector)
            stories.forEach((story: Element) => this.transformStory(story as HTMLElement))
        }
    }

    private async transformItem(item: HTMLElement): Promise<void> {
        const presentation: CustomSearchElementResult = item.closest('[role="presentation"]')
        if (!presentation || presentation.classList.contains('logist-affected')) {
            return
        }

        presentation.classList.add('logist-affected')

        const userName: string = item.innerText.trim()
        const container: HTMLDivElement = document.createElement('div')
        container.classList.add('logist-avatar-container')

        if (this.settings.toggleRoleNameUnderIcon.toggled && item.dataset.issuefieldid) {
            container.dataset.name = this.getSuffixOfRole(item.dataset.issuefieldid)
        }

        const image: HTMLImageElement = document.createElement('img')
        image.classList.add('logist-avatar-24')
        image.src = this.users[userName]?.avatarUrl || ''

        if (item.dataset.issuefieldid) {
            image.title = `${this.getTitleOfRole(item.dataset.issuefieldid)}: ${userName}`
        }

        container.append(image)

        const avatarContainer: CustomSearchElementResult = item
            .closest(this.kanbanItemSelector)
            ?.querySelector(`${this.avatarContainerSelector}, ${this.avatarWrapperSelector}`)

        if (!avatarContainer) {
            return
        }

        avatarContainer.before(container)
    }

    private async transformStory(story: HTMLElement): Promise<void> {
        const content: CustomSearchElementResult = story.querySelector(this.storyContentSelector)
        if (!content || content.classList.contains('logist-affected')) {
            return
        }

        content.classList.add('logist-affected')

        const taskElement: HTMLElement | null = content.querySelector('[role="presentation"] a[href] > span')
        if (!taskElement) {
            return
        }

        const taskName: string = taskElement.innerText ?? ''
        if (taskName.length === 0) {
            return
        }

        const issue: CustomJiraIssue = this.issues[taskName]
        if (!issue) {
            return
        }

        const avatarContainer: CustomSearchElementResult = content
            .querySelector('[role="img"] img')
            ?.closest('[role="presentation"]')
            ?.parentElement

        if (!avatarContainer) {
            return
        }

        for (let customCardExtraField of issue.cardExtraFields) {
            const userName: string = customCardExtraField.text
            const container: HTMLDivElement = document.createElement('div')
            container.classList.add('logist-avatar-container')

            if (this.settings.toggleRoleNameUnderIcon.toggled && customCardExtraField.id) {
                container.dataset.name = this.getSuffixOfRole(customCardExtraField.id)
            }

            const image: HTMLImageElement = document.createElement('img')
            image.classList.add('logist-avatar-24')
            image.src = this.users[userName]?.avatarUrl || ''

            if (customCardExtraField.id) {
                image.title = `${this.getTitleOfRole(customCardExtraField.id)}: ${userName}`
            }

            container.append(image)

            avatarContainer.before(container)
        }
    }

    private initMutator(): void {
        const observer: MutationObserver = new MutationObserver(this.mutatorCallback.bind(this))

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        } as MutationObserverInit)
    }

    private mutatorCallback(mutations: MutationRecord[]): void {
        mutations.forEach((mutation: MutationRecord) => this.nodeAffector(Array.from(mutation.addedNodes)))
    }

    private async nodeAffector(nodes: Node[]): Promise<void> {
        nodes.forEach((node: Node): void => {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return
            }

            const nodeElement: HTMLElement = node as HTMLElement

            if (this.settings.toggleCardAvatars.toggled && nodeElement.matches(this.kanbanItemSelector)) {
                nodeElement.querySelectorAll(this.itemSelector)
                    .forEach((item: Element) => this.transformItem(item as HTMLElement))
            } else if (this.settings.toggleStoriesAvatars.toggled && nodeElement.matches(this.storySelector)) {
                this.transformStory(nodeElement)
            }
        })
    }

    private getRoleField(id: string): CustomTransformerCustomField | null {
        const [_, field] = id.split('_')
        if (!field || !this.customFields[field]) {
            return null
        }

        return this.customFields[field]
    }

    private getSuffixOfRole(id: string): string {
        const field: CustomTransformerCustomField | null = this.getRoleField(id)
        if (!field) {
            return ''
        }

        return field.shortname
    }

    private getTitleOfRole(id: string): string {
        const field: CustomTransformerCustomField | null = this.getRoleField(id)
        if (!field) {
            return ''
        }

        return field.name ?? ''
    }

    private async appendStyles(): Promise<void> {
        this.backgroundColor = '#21272c'
        this.color = '#ffffff'

        if (document.querySelector('html')?.dataset.colorMode === 'light') {
            this.backgroundColor = '#ffffff'
            this.color = '#333333'
        }

        GM_addStyle(generateStyle(this))
    }
}
