export class FetchInterceptor {
    private originalFetch!: CustomFetch
    private readonly intercepting: CustomFetchIntercepting

    constructor(intercepting: CustomFetchIntercepting = {}) {
        this.intercepting = intercepting
        this.initInterceptFetch()
    }

    private initInterceptFetch(): void {
        this.originalFetch = window.fetch

        unsafeWindow.fetch = this.interceptFetch.bind(this)
    }

    private async interceptFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const [url]: string[] = (input as string).split('?')
        if (!(url in this.intercepting)) {
            return await this.originalFetch(input, init)
        }

        if (typeof this.intercepting[url].before !== 'undefined') {
            const rewroteFetchInputData = this.intercepting[url].before(input, init)
            input = rewroteFetchInputData.input
            init = rewroteFetchInputData.init
        }

        const response: Response = await this.originalFetch(input, init)
        this.collector(url, response)

        return response
    }

    private async collector(url: string, response: Response): Promise<void> {
        if (typeof this.intercepting[url].after === 'undefined') {
            return
        }

        const clonedResult: CustomFetchResult = await this.handleResponse(response)
        this.intercepting[url].after(clonedResult)
    }

    private async handleResponse(response: Response): Promise<CustomFetchResult> {
        const clonedResponse: Response = response.clone()

        try {
            return await clonedResponse.json()
        } catch (err) {
            return await clonedResponse.text()
        }
    }
}
