from django.contrib import admin

from mail.models import Email, User

admin.site.register(User)
admin.site.register(Email)