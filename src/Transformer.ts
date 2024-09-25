type User = {
    displayName: string
    avatarUrls: Record<string, string>
}

export class Transformer {
    private itemSelector: string
    private kanbanItemSelector: string
    private avatarContainerSelector: string
    private avatarWrapperSelector: string
    private qaId: string
    private revId: string
    private backgroundColor: string
    private color: string
    private users: Record<string, User> = {}

    constructor() {
        console.log('Transformer - init')

        this.itemSelector = '[data-testid*=".custom-fields.card-custom-field"]'
        this.kanbanItemSelector = '[data-testid="software-board.board-container.board.card-container.card-with-icc"]'
        this.avatarContainerSelector = '[data-testid="software-board.board-container.board.card-container.card.assignee-field.button"]'
        this.avatarWrapperSelector = '[data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper"]'

        this.qaId = 'customfield_10079'
        this.revId = 'customfield_10080'

        this.backgroundColor = '#21272c'
        this.color = '#ffffff'

        if (document.querySelector('html')?.dataset.colorMode === 'light') {
            this.backgroundColor = '#ffffff'
            this.color = '#333333'
        }

        this.init()
    }

    private async init() {
        this.appendStyles()
        this.users = await this.getUsers()

        this.transformPage()
        this.initMutator()
    }

    private appendStyles() {
        GM_addStyle(
            `${this.kanbanItemSelector} [data-testid="platform-card.common.ui.custom-fields.custom-card-field-list"] { display: none !important; }`
        )

        GM_addStyle(
            `${this.kanbanItemSelector} .logist-avatar-container { width: 9px; height: 24px; position: relative; margin-top: 2px; }`
        )

        GM_addStyle(
            `${this.kanbanItemSelector} .logist-avatar-24, ${this.kanbanItemSelector} [data-vc="avatar-image"],${this.kanbanItemSelector}  [data-vc="issue-field-assignee.common.ui.read-view.popover.avatar--image"] {
                min-width: 24px;
                min-height: 24px;
                max-width: 24px;
                max-height: 24px;
                border-radius: 50%;
                position: absolute;
                border: 2px solid ${this.backgroundColor};
                box-sizing: border-box;
            }`
        )

        GM_addStyle(
            `${this.kanbanItemSelector} [data-vc="avatar-image"], ${this.kanbanItemSelector} [data-vc="issue-field-assignee.common.ui.read-view.popover.avatar--image"] { margin-top: 2px; }`
        )

        GM_addStyle(
            `${this.kanbanItemSelector} .logist-avatar-container:after {
                content: attr(data-name);
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                width: 16px;
                height: 16px;
                left: 3px;
                top: -11px;
                color: ${this.color};
                font-size: 12px;
                border-radius: 50%;
                background-color: ${this.backgroundColor}9a;
            }`
        )
    }

    private async getUsers(): Promise<Record<string, User>> {
        const response = await fetch('/rest/api/3/users?maxResults=100')
        const result: User[] = await response.json()

        return result.reduce((acc, user) => {
            acc[user.displayName] = user
            return acc
        }, {} as Record<string, User>)
    }

    private transformPage() {
        const list = document.querySelectorAll(this.itemSelector)
        list.forEach((item) => this.transformRow(item as HTMLElement))
    }

    private async transformRow(item: HTMLElement) {
        const presentation = item.closest('[role="presentation"]')
        if (presentation?.classList.contains('4logist-affected')) {
            return
        }

        presentation?.classList.add('4logist-affected')

        setTimeout(() => {
            const userName = item.innerText.trim()
            const container = document.createElement('div')
            container.classList.add('logist-avatar-container')
            container.dataset.name = this.getSuffixOfRole(item.dataset.issuefieldid || '')

            const image = document.createElement('img')
            image.classList.add('logist-avatar-24')
            image.src = this.users[userName]?.avatarUrls['24x24'] || ''

            container.append(image)

            const avatarContainer = item
                .closest(this.kanbanItemSelector)
                ?.querySelector(`${this.avatarContainerSelector}, ${this.avatarWrapperSelector}`)

            avatarContainer?.before(container)
        })
    }

    private initMutator() {
        const observer = new MutationObserver(this.mutatorCallback.bind(this))

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
    }

    private mutatorCallback(mutations: MutationRecord[]) {
        mutations.forEach((mutation) => this.nodeAffector(Array.from(mutation.addedNodes)))
    }

    private nodeAffector(nodes: Node[]) {
        nodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && (node as Element).matches(this.kanbanItemSelector)) {
                (node as Element).querySelectorAll(this.itemSelector)
                    .forEach((item: Element) => this.transformRow(item as HTMLElement))
            }
        })
    }

    private getSuffixOfRole(id: string): string {
        switch (id) {
            case this.qaId:
                return 'q'
            case this.revId:
                return 'r'
            default:
                return ''
        }
    }
}
