export function stripHtml(input: string) {
  return input.replace(/(<([^>]+)>)/gi, '')
}

export class LoginBypass {
  private COOKIE_NAME = 'cafe-key'
  private VALID_KEYS = {
    'GENERELL': 'generell',
  }

  constructor(private $cookies: any) {}

  enable(key: string): boolean {
    if (!key || !this.valid(key)) {
      return false
    }
    this.$cookies.set(this.COOKIE_NAME, key, {
      path: '/',
      maxAge: 60 * 60 * 4
    })
    return true
  }

  check(): boolean {
    const cookie = this.$cookies.get(this.COOKIE_NAME)
    return this.valid(cookie)
  }

  private valid(value: string): boolean {
    return Object.values(this.VALID_KEYS).indexOf(value) > -1
  }
}
