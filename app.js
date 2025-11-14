async function fetchPosts() {
  const grid = document.getElementById('product-grid');
  const status = document.getElementById('status');
  try {
    const res = await fetch(BLOG_FEED_JSON, {cache: 'no-store'});
    if (!res.ok) throw new Error('Feed gagal diambil: ' + res.status);
    const data = await res.json();
    const items = (data.feed && data.feed.entry) || [];
    if (!items.length) {
      status.textContent = 'Belum ada produk.';
      return;
    }
    status.style.display = 'none';

    items.forEach(entry => {
      const title = entry.title?.$t || 'Tanpa judul';

      // image: thumbnail or first <img> in content
      let image = DEFAULT_PLACEHOLDER;
      if (entry.media$thumbnail && entry.media$thumbnail.url) {
        image = entry.media$thumbnail.url.replace(/\\/s72-c/, '/s400');
      } else if (entry.content && entry.content.$t) {
        const m = entry.content.$t.match(/<img[^>]+src="([^">]+)"/i);
        if (m) image = m[1];
      }

      // price/snippet
      let price = '';
      if (entry.summary && entry.summary.$t) {
        price = entry.summary.$t.replace(/<[^>]+>/g, '').trim().slice(0,120);
      } else if (entry.content && entry.content.$t) {
        price = entry.content.$t.replace(/<[^>]+>/g, '').trim().slice(0,120);
      }

      const link = (entry.link || []).find(l => l.rel === 'alternate')?.href || '#';

      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <a href="${link}" target="_self" rel="noopener">
          <img loading="lazy" src="${image}" alt="${title}">
        </a>
        <h3>${title}</h3>
        <div class="price">${price}</div>
        <a class="buy-btn" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo, saya mau pesan: ' + title)}" target="_blank" rel="noopener">Beli Sekarang</a>
      `;
      grid.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    status.textContent = 'Gagal memuat produk. Coba lagi nanti.';
  }
}

fetchPosts();
