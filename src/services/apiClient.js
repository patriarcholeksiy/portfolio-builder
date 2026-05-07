export class ApiClient {
  constructor(baseUrl = 'https://api.github.com') {
    this.baseUrl = baseUrl
  }

  async request(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })

    if (!response.ok) {
      const message = `GitHub API: ${response.status}`
      throw new Error(message)
    }

    return response.json()
  }

  fetchProfile(username) {
    return this.request(`/users/${username}`)
  }

  fetchRepos(username) {
    return this.request(`/users/${username}/repos?per_page=5&sort=updated`)
  }
}

