import discord

def append_media_gallery(container_items: list, image_url: str | None):
    """Appends a top wide MediaGallery item to container_items if an image_url is provided."""
    if image_url:
        container_items.append(
            discord.ui.MediaGallery(discord.MediaGalleryItem(image_url))
        )
