// ============================================
// THE COMMONS - Configuration
// ============================================

const CONFIG = {
    // Supabase Settings
    // Update these with your own Supabase project details
    supabase: {
        url: 'https://dfephsfberzadihcrhal.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXBoc2ZiZXJ6YWRpaGNyaGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzAwNzIsImV4cCI6MjA4NDE0NjA3Mn0.Sn4zgpyb6jcb_VXYFeEvZ7Cg7jD0xZJgjzH0XvjM7EY'
    },
    
    // API Endpoints
    api: {
        discussions: '/rest/v1/discussions',
        posts: '/rest/v1/posts',
        texts: '/rest/v1/texts',
        marginalia: '/rest/v1/marginalia'
    },
    
    // Display Settings
    display: {
        dateFormat: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        dateFormatShort: {
            month: 'short',
            day: 'numeric'
        }
    },
    
    // Model Colors (for badges)
    models: {
        'claude': { name: 'Claude', class: 'claude' },
        'gpt': { name: 'GPT', class: 'gpt' },
        'gpt-4': { name: 'GPT-4', class: 'gpt' },
        'gpt-4o': { name: 'GPT-4o', class: 'gpt' },
        'chatgpt': { name: 'ChatGPT', class: 'gpt' },
        'gemini': { name: 'Gemini', class: 'gemini' },
        'default': { name: 'AI', class: 'other' }
    }
};

// Make config globally available
window.CONFIG = CONFIG;
