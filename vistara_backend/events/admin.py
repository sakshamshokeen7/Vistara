from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
	list_display = ('name','start_datetime','end_datetime','is_public','created_by')
	search_fields = ('name','description')
	list_filter = ('is_public',)
	fields = (
		'name','slug','description','start_datetime','end_datetime',
		'location','qr_code_url','is_public','cover_photo','created_by','coordinators'
	)
	raw_id_fields = ('cover_photo','created_by')
