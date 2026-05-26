import os

file_path = 'src/pages/Admin.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 4. Replace confirm functions (using current state of file)
del_banner_old = '''  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      await loadBanners()
    } catch (err) {
      showAlert('Error', 'Error deleting banner: ' + err.message)
    } finally {
      setLoading(false)
    }
  }'''
del_banner_new = '''  const deleteBanner = (id) => {
    showConfirm('Delete Banner?', 'Are you sure you want to delete this banner?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('banners').delete().eq('id', id)
        if (error) throw error
        await loadBanners()
      } catch (err) {
        showAlert('Error', 'Error deleting banner: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }'''
content = content.replace(del_banner_old, del_banner_new)

del_series_old = '''  const deleteSeries = async (id) => {
    if (!confirm('Warning: Deleting a series will also orphan or break related episodes. Are you sure you want to delete this series?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('series').delete().eq('id', id)
      if (error) throw error
      await loadSeriesAndEpisodes()
    } catch (err) {
      showAlert('Error', 'Error deleting series: ' + err.message)
    } finally {
      setLoading(false)
    }
  }'''
del_series_new = '''  const deleteSeries = (id) => {
    showConfirm('Delete Series?', 'Warning: Deleting a series will also orphan or break related episodes. Are you sure you want to delete this series?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('series').delete().eq('id', id)
        if (error) throw error
        await loadSeriesAndEpisodes()
      } catch (err) {
        showAlert('Error', 'Error deleting series: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }'''
content = content.replace(del_series_old, del_series_new)

del_ep_old = '''  const deleteEpisode = async (id) => {
    if (!confirm('Are you sure you want to delete this episode?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('episodes').delete().eq('id', id)
      if (error) throw error
      await loadSeriesAndEpisodes()
    } catch (err) {
      showAlert('Error', 'Error deleting episode: ' + err.message)
    } finally {
      setLoading(false)
    }
  }'''
del_ep_new = '''  const deleteEpisode = (id) => {
    showConfirm('Delete Episode?', 'Are you sure you want to delete this episode?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('episodes').delete().eq('id', id)
        if (error) throw error
        await loadSeriesAndEpisodes()
      } catch (err) {
        showAlert('Error', 'Error deleting episode: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }'''
content = content.replace(del_ep_old, del_ep_new)

del_music_old = '''  const deleteMusic = async (id) => {
    if (!confirm('Are you sure you want to delete this music track?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('music_tracks').delete().eq('id', id)
      if (error) throw error
      await loadMusic()
    } catch (err) {
      showAlert('Error', 'Error deleting music track: ' + err.message)
    } finally {
      setLoading(false)
    }
  }'''
del_music_new = '''  const deleteMusic = (id) => {
    showConfirm('Delete Track?', 'Are you sure you want to delete this music track?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('music_tracks').delete().eq('id', id)
        if (error) throw error
        await loadMusic()
      } catch (err) {
        showAlert('Error', 'Error deleting music track: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }'''
content = content.replace(del_music_old, del_music_new)

del_short_old = '''  const deleteShort = async (id) => {
    if (!confirm('Are you sure you want to delete this short?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('shorts').delete().eq('id', id)
      if (error) throw error
      await loadShorts()
    } catch (err) {
      showAlert('Error', 'Error deleting short: ' + err.message)
    } finally {
      setLoading(false)
    }
  }'''
del_short_new = '''  const deleteShort = (id) => {
    showConfirm('Delete Short?', 'Are you sure you want to delete this short?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('shorts').delete().eq('id', id)
        if (error) throw error
        await loadShorts()
      } catch (err) {
        showAlert('Error', 'Error deleting short: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }'''
content = content.replace(del_short_old, del_short_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success replacing confirms')
