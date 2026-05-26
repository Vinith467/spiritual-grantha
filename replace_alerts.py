import os

file_path = 'src/pages/Admin.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Custom Modal State
state_code = '''  const [editingShortId, setEditingShortId] = useState(null)

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: null,
    onCloseAction: null
  })

  const showAlert = useCallback((title, message, onClose = null) => {
    setModalConfig({ isOpen: true, type: 'alert', title, message, onConfirm: null, onCloseAction: onClose })
  }, [])

  const showConfirm = useCallback((title, message, onConfirmAction) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, onConfirm: onConfirmAction, onCloseAction: null })
  }, [])'''

content = content.replace('  const [editingShortId, setEditingShortId] = useState(null)', state_code)

# 2. Fix useEffect Access Denied
useEffect_old = '''    } else {
      alert('Access Denied: You are not authorized to view the Admin Dashboard.')
      navigate('/home')
    }'''
useEffect_new = '''    } else {
      setModalConfig({
        isOpen: true,
        type: 'alert',
        title: 'Access Denied',
        message: 'You are not authorized to view the Admin Dashboard.',
        onCloseAction: () => navigate('/home')
      })
    }'''
content = content.replace(useEffect_old, useEffect_new)

# 3. Replace simple alerts
content = content.replace("alert('Error saving banner: ' + err.message)", "showAlert('Error', 'Error saving banner: ' + err.message)")
content = content.replace("alert('Error deleting banner: ' + err.message)", "showAlert('Error', 'Error deleting banner: ' + err.message)")

content = content.replace("alert('Error saving series: ' + err.message)", "showAlert('Error', 'Error saving series: ' + err.message)")
content = content.replace("alert('Error deleting series: ' + err.message)", "showAlert('Error', 'Error deleting series: ' + err.message)")

content = content.replace("alert('Error saving episode: ' + err.message)", "showAlert('Error', 'Error saving episode: ' + err.message)")
content = content.replace("alert('Error deleting episode: ' + err.message)", "showAlert('Error', 'Error deleting episode: ' + err.message)")

content = content.replace("alert('Error saving music: ' + err.message)", "showAlert('Error', 'Error saving music: ' + err.message)")
content = content.replace("alert('Error deleting music track: ' + err.message)", "showAlert('Error', 'Error deleting music track: ' + err.message)")

content = content.replace("alert('Error saving short: ' + err.message)", "showAlert('Error', 'Error saving short: ' + err.message)")
content = content.replace("alert('Error deleting short: ' + err.message)", "showAlert('Error', 'Error deleting short: ' + err.message)")

content = content.replace("alert('Upload failed: ' + err.message)", "showAlert('Upload Failed', err.message)")

# 4. Replace confirm functions
del_banner_old = '''  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      await loadBanners()
    } catch (err) {
      alert('Error deleting banner: ' + err.message)
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
      alert('Error deleting series: ' + err.message)
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
      alert('Error deleting episode: ' + err.message)
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
      alert('Error deleting music track: ' + err.message)
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
      alert('Error deleting short: ' + err.message)
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

# 5. Insert Custom Modal JSX at the end
modal_jsx = '''

      {/* Custom Admin Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border ${modalConfig.type === 'confirm' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#FF9933]/10 border-[#FF9933]/20 text-[#FF9933]'}`}>
                {modalConfig.type === 'confirm' ? (
                  <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">{modalConfig.title}</h3>
              <p className="text-xs text-gray-400 font-medium">{modalConfig.message}</p>
            </div>
            <div className={`grid ${modalConfig.type === 'confirm' ? 'grid-cols-2 gap-px' : 'grid-cols-1'} bg-white/10 border-t border-white/10`}>
              {modalConfig.type === 'confirm' && (
                <button 
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="bg-[#1a1a1a] p-4 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white transition active:bg-white/10"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  setModalConfig(prev => ({ ...prev, isOpen: false }))
                  if (modalConfig.type === 'confirm' && modalConfig.onConfirm) {
                    modalConfig.onConfirm()
                  } else if (modalConfig.type === 'alert' && modalConfig.onCloseAction) {
                    modalConfig.onCloseAction()
                  }
                }}
                className={`bg-[#1a1a1a] p-4 text-sm font-bold transition ${modalConfig.type === 'confirm' ? 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20' : 'text-[#FF9933] hover:bg-[#FF9933]/10 active:bg-[#FF9933]/20'}`}
              >
                {modalConfig.type === 'confirm' ? 'Yes, proceed' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}'''

content = content.replace('    </div>\n  )\n}', modal_jsx)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
