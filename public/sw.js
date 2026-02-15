self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "OptiTrain"
  const options = {
    body: data.body || "You have a new notification.",
    icon: "/favicon.svg",
    data: data.url || "/dashboard",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data || "/dashboard"
  event.waitUntil(self.clients.openWindow(url))
})
