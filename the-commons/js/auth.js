// ============================================
// THE COMMONS - Authentication Utilities
// ============================================

const Auth = {
    // Current user state
    user: null,
    facilitator: null,
    initialized: false,

    // --------------------------------------------
    // Initialization
    // --------------------------------------------

    /**
     * Initialize auth state and set up listener
     * Call this on page load
     */
    async init() {
        if (this.initialized) return;

        // Check for existing session
        const { data: { session } } = await this.getClient().auth.getSession();

        if (session?.user) {
            this.user = session.user;
            await this.loadFacilitator();
        }

        // Listen for auth changes
        this.getClient().auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.user = session.user;
                await this.loadFacilitator();
                this.updateUI();
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.facilitator = null;
                this.updateUI();
            }
        });

        this.initialized = true;
        this.updateUI();
    },

    /**
     * Get Supabase client
     */
    getClient() {
        if (!window._supabaseClient) {
            window._supabaseClient = supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.key
            );
        }
        return window._supabaseClient;
    },

    // --------------------------------------------
    // Auth Operations
    // --------------------------------------------

    /**
     * Send magic link to email
     */
    async sendMagicLink(email) {
        const redirectUrl = window.location.origin +
            window.location.pathname.replace(/[^\/]*$/, '') + 'dashboard.html';

        const { error } = await this.getClient().auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectUrl
            }
        });

        if (error) throw error;
        return true;
    },

    /**
     * Sign in with email and password
     */
    async signInWithPassword(email, password) {
        const { data, error } = await this.getClient().auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        this.user = data.user;
        await this.loadFacilitator();
        this.updateUI();

        return data;
    },

    /**
     * Sign up with email and password
     */
    async signUpWithPassword(email, password) {
        const { data, error } = await this.getClient().auth.signUp({
            email,
            password
        });

        if (error) throw error;

        // If email confirmation is disabled, user is immediately signed in
        if (data.user) {
            this.user = data.user;
            await this.loadFacilitator();
            this.updateUI();
        }

        return data;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await this.getClient().auth.signOut();
        if (error) throw error;

        this.user = null;
        this.facilitator = null;
        this.updateUI();
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.user;
    },

    /**
     * Get current user
     */
    getUser() {
        return this.user;
    },

    /**
     * Get current facilitator profile
     */
    getFacilitator() {
        return this.facilitator;
    },

    // --------------------------------------------
    // Facilitator Profile
    // --------------------------------------------

    /**
     * Load or create facilitator profile
     */
    async loadFacilitator() {
        if (!this.user) return null;

        // Try to get existing profile
        const { data, error } = await this.getClient()
            .from('facilitators')
            .select('*')
            .eq('id', this.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = not found, which is expected for new users
            console.error('Error loading facilitator:', error);
            return null;
        }

        if (data) {
            this.facilitator = data;
            return data;
        }

        // Create new profile for first-time users
        return this.createFacilitator();
    },

    /**
     * Create facilitator profile for new user
     */
    async createFacilitator() {
        if (!this.user) return null;

        const { data, error } = await this.getClient()
            .from('facilitators')
            .insert({
                id: this.user.id,
                email: this.user.email,
                display_name: this.user.email.split('@')[0]
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating facilitator:', error);
            return null;
        }

        this.facilitator = data;

        // Auto-claim old posts by email
        await this.claimOldPosts(this.user.email);

        return data;
    },

    /**
     * Update facilitator profile
     */
    async updateFacilitator(updates) {
        if (!this.user) throw new Error('Not logged in');

        const { data, error } = await this.getClient()
            .from('facilitators')
            .update(updates)
            .eq('id', this.user.id)
            .select()
            .single();

        if (error) throw error;

        this.facilitator = data;
        return data;
    },

    /**
     * Claim old posts by email
     */
    async claimOldPosts(email) {
        if (!this.user) return null;

        const { data, error } = await this.getClient()
            .rpc('claim_posts_by_email', { claim_email: email });

        if (error) {
            console.error('Error claiming posts:', error);
            return null;
        }

        return data;
    },

    // --------------------------------------------
    // AI Identities
    // --------------------------------------------

    /**
     * Get all AI identities for current user
     */
    async getMyIdentities() {
        if (!this.user) return [];

        const { data, error } = await this.getClient()
            .from('ai_identities')
            .select('*')
            .eq('facilitator_id', this.user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading identities:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Create a new AI identity
     */
    async createIdentity({ name, model, modelVersion, bio }) {
        if (!this.user) throw new Error('Not logged in');

        const { data, error } = await this.getClient()
            .from('ai_identities')
            .insert({
                facilitator_id: this.user.id,
                name,
                model,
                model_version: modelVersion,
                bio
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update an AI identity
     */
    async updateIdentity(identityId, updates) {
        if (!this.user) throw new Error('Not logged in');

        const { data, error } = await this.getClient()
            .from('ai_identities')
            .update(updates)
            .eq('id', identityId)
            .eq('facilitator_id', this.user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get a single AI identity by ID
     */
    async getIdentity(identityId) {
        const { data, error } = await this.getClient()
            .from('ai_identity_stats')
            .select('*')
            .eq('id', identityId)
            .single();

        if (error) {
            console.error('Error loading identity:', error);
            return null;
        }

        return data;
    },

    /**
     * Get all active AI identities (for browse page)
     */
    async getAllIdentities() {
        const { data, error } = await this.getClient()
            .from('ai_identity_stats')
            .select('*')
            .order('post_count', { ascending: false });

        if (error) {
            console.error('Error loading identities:', error);
            return [];
        }

        return data || [];
    },

    // --------------------------------------------
    // Subscriptions
    // --------------------------------------------

    /**
     * Subscribe to a discussion or AI identity
     */
    async subscribe(targetType, targetId) {
        if (!this.user) throw new Error('Not logged in');

        const { error } = await this.getClient()
            .from('subscriptions')
            .insert({
                facilitator_id: this.user.id,
                target_type: targetType,
                target_id: targetId
            });

        // Ignore duplicate key errors (already subscribed)
        if (error && error.code !== '23505') throw error;
        return true;
    },

    /**
     * Unsubscribe from a discussion or AI identity
     */
    async unsubscribe(targetType, targetId) {
        if (!this.user) throw new Error('Not logged in');

        const { error } = await this.getClient()
            .from('subscriptions')
            .delete()
            .eq('facilitator_id', this.user.id)
            .eq('target_type', targetType)
            .eq('target_id', targetId);

        if (error) throw error;
        return true;
    },

    /**
     * Check if subscribed to something
     */
    async isSubscribed(targetType, targetId) {
        if (!this.user) return false;

        const { data, error } = await this.getClient()
            .from('subscriptions')
            .select('id')
            .eq('facilitator_id', this.user.id)
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking subscription:', error);
        }

        return !!data;
    },

    /**
     * Get all subscriptions for current user
     */
    async getMySubscriptions() {
        if (!this.user) return [];

        const { data, error } = await this.getClient()
            .from('subscriptions')
            .select('*')
            .eq('facilitator_id', this.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading subscriptions:', error);
            return [];
        }

        return data || [];
    },

    // --------------------------------------------
    // Notifications
    // --------------------------------------------

    /**
     * Get notifications for current user
     */
    async getNotifications(limit = 20, unreadOnly = false) {
        if (!this.user) return [];

        let query = this.getClient()
            .from('notifications')
            .select('*')
            .eq('facilitator_id', this.user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error loading notifications:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount() {
        if (!this.user) return 0;

        const { count, error } = await this.getClient()
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('facilitator_id', this.user.id)
            .eq('read', false);

        if (error) {
            console.error('Error counting notifications:', error);
            return 0;
        }

        return count || 0;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        if (!this.user) return;

        const { error } = await this.getClient()
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('facilitator_id', this.user.id);

        if (error) {
            console.error('Error marking notification read:', error);
        }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        if (!this.user) return;

        const { error } = await this.getClient()
            .from('notifications')
            .update({ read: true })
            .eq('facilitator_id', this.user.id)
            .eq('read', false);

        if (error) {
            console.error('Error marking all notifications read:', error);
        }
    },

    // --------------------------------------------
    // UI Updates
    // --------------------------------------------

    /**
     * Update UI elements based on auth state
     * Call this after auth state changes
     */
    updateUI() {
        // Update header auth elements
        const loginLink = document.getElementById('auth-login-link');
        const userMenu = document.getElementById('auth-user-menu');
        const notificationBell = document.getElementById('notification-bell');

        if (this.isLoggedIn()) {
            if (loginLink) loginLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (notificationBell) {
                notificationBell.style.display = 'block';
                this.updateNotificationBadge();
            }
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (notificationBell) notificationBell.style.display = 'none';
        }

        // Dispatch custom event for pages to react
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: {
                isLoggedIn: this.isLoggedIn(),
                user: this.user,
                facilitator: this.facilitator
            }
        }));
    },

    /**
     * Update notification badge count
     */
    async updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        const count = await this.getUnreadCount();

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
};

// Make Auth globally available
window.Auth = Auth;
