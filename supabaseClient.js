// supabaseClient.js - Fichier central pour la connexion à Supabase

const SUPABASE_URL = 'https://lcwsrrmhtmrpxviorofz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjd3Nycm1odG1ycHh2aW9yb2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTA3NDcsImV4cCI6MjA3NjAyNjc0N30.mujEtrJ55HkBFFdXVIFM1F-ZpaKZsoUwqTvoVmfikqA';

// Vérifier si supabaseClient existe déjà pour éviter de le recréer
if (!window.supabaseClient) {
    // Créer le client Supabase à partir de l'objet global `supabase` fourni par le CDN
    const supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    /**
     * Récupère l'objet utilisateur actuellement connecté en se basant sur la session.
     * C'est plus robuste car elle attend l'initialisation de Supabase.
     * @returns {Promise<object|null>} L'objet utilisateur ou null s'il n'est pas connecté.
     */
    async function getCurrentUser() {
        try {
            // getSession est la méthode recommandée pour récupérer la session et l'utilisateur
            const { data: { session }, error } = await supabaseInstance.auth.getSession();
            if (error) throw error;
            
            // Si la session n'existe pas, on retourne null explicitement
            if (!session) {
                console.log("Aucune session active trouvée.");
                return null;
            }
            
            // On retourne l'objet utilisateur complet
            return session.user;

        } catch (error) {
            console.error("Erreur lors de la récupération de la session:", error.message);
            return null;
        }
    }

    /**
     * Récupère le profil complet de l'utilisateur depuis la table 'users_profile'.
     * @param {string} userId - L'ID de l'utilisateur.
     * @returns {Promise<object|null>} L'objet profil ou null en cas d'erreur.
     */
    async function getUserProfile(userId) {
        // Garde-fou : si aucun userId n'est fourni, on ne fait pas de requête
        if (!userId) {
            console.error("getUserProfile a été appelé sans userId.");
            return null;
        }

        try {
            const { data, error, status } = await supabaseInstance
                .from('users_profile')
                .select('*') // Vous pouvez spécifier les colonnes : `prenom, nom, role`
                .eq('user_id', userId)
                .single();

            // Gère le cas où aucun profil n'est trouvé (erreur 406), sans bloquer l'application
            if (error && status !== 406) {
                throw error;
            }

            return data;

        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error.message);
            return null;
        }
    }

    /**
     * Vérifie si un utilisateur est actuellement authentifié.
     * @returns {Promise<boolean>} Vrai si l'utilisateur est connecté, sinon faux.
     */
    async function checkAuth() {
        const user = await getCurrentUser();
        return user !== null;
    }

    /**
     * Déconnecte l'utilisateur actuel.
     * @returns {Promise<boolean>} Vrai si la déconnexion a réussi, sinon faux.
     */
    async function signOut() {
        const { error } = await supabaseInstance.auth.signOut();
        if (error) {
            console.error('Erreur lors de la déconnexion:', error.message);
            return false;
        }
        return true;
    }

    /**
     * Redirige l'utilisateur vers la page appropriée en fonction de son rôle.
     */
    async function redirectByRole() {
        const user = await getCurrentUser();
        
        if (!user) {
            // Pas d'utilisateur, on ne fait rien. La page de connexion reste affichée.
            console.log("Redirection annulée : utilisateur non connecté.");
            return;
        }

        const profile = await getUserProfile(user.id);
        
        if (!profile) {
            // Si le profil n'existe pas, c'est une erreur critique. On déconnecte.
            alert('Erreur: Profil utilisateur introuvable. Déconnexion.');
            await signOut();
            window.location.reload(); // Recharger la page pour refléter l'état déconnecté
            return;
        }

        // Redirection simplifiée selon les rôles
        if (profile.role === 'admin') {
            window.location.href = 'publier.html';
        } else {
            window.location.href = 'index.html';
        }
    }

    // Exposer les fonctions et le client sur l'objet window pour un accès global
    window.supabaseClient = {
        supabase: supabaseInstance,
        getCurrentUser,
        getUserProfile,
        checkAuth,
        signOut,
        redirectByRole
    };
}
