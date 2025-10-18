// commentaires.js - Widget de commentaires réutilisable avec rechargement optimisé

window.CommentsWidget = {
    currentArticleId: null,
    refreshCallback: null,

    async render(container, articleId, comments, currentUser, userProfile, refreshCallback) {
        this.currentArticleId = articleId;
        this.refreshCallback = refreshCallback;

        // Sauvegarder la position de scroll actuelle
        const scrollPosition = container.scrollTop || 0;
        const wasScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

        container.innerHTML = `
            <style>
                .comments-widget {
                    padding: 20px;
                }
                
                .comment-item {
                    padding: 15px;
                    border-bottom: 1px solid var(--border-color);
                    position: relative;
                }
                
                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                
                .comment-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a1a1a;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
                }
                
                .comment-author {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .comment-date {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-left: auto;
                }
                
                .comment-text {
                    color: var(--text-primary);
                    margin: 8px 0;
                    padding-left: 45px;
                    line-height: 1.5;
                }
                
                .comment-actions {
                    padding-left: 45px;
                    display: flex;
                    gap: 15px;
                }
                
                .comment-btn {
                    background: none;
                    border: none;
                    color: #ffd700;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                
                .comment-btn:hover {
                    text-decoration: underline;
                    transform: translateX(3px);
                }
                
                .replies-container {
                    margin-left: 45px;
                    border-left: 2px solid var(--border-color);
                    padding-left: 15px;
                    margin-top: 10px;
                }
                
                .reply-item {
                    padding: 10px 0;
                }
                
                .comment-input-box {
                    margin-top: 15px;
                    padding: 15px;
                    background: var(--bg-primary);
                    border-radius: 12px;
                }
                
                .comment-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid var(--border-color);
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 14px;
                    min-height: 80px;
                    resize: vertical;
                    transition: border-color 0.3s;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                
                .comment-textarea:focus {
                    outline: none;
                    border-color: #ffd700;
                    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
                }
                
                .comment-submit {
                    margin-top: 10px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    color: #1a1a1a;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }
                
                .comment-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
                }

                .comment-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .no-comments {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-tertiary);
                }

                .no-comments i {
                    font-size: 40px;
                    margin-bottom: 10px;
                    display: block;
                    opacity: 0.5;
                }

                .comment-loading {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    gap: 10px;
                    color: var(--text-secondary);
                }

                .comment-spinner {
                    border: 2px solid var(--border-color);
                    border-top: 2px solid #ffd700;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .comment-success-message {
                    background: rgba(76, 175, 80, 0.1);
                    border: 2px solid #4caf50;
                    color: #4caf50;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
            
            <div class="comments-widget">
                ${comments.length === 0 ? `
                    <div class="no-comments">
                        <i class="fas fa-comments"></i>
                        <p>Aucun commentaire pour le moment</p>
                        <p style="font-size: 13px; margin-top: 5px;">Soyez le premier à commenter !</p>
                    </div>
                ` : ''}
                
                <div id="comments-list-${articleId}">
                    ${await this.renderComments(comments, articleId, currentUser)}
                </div>
                
                ${currentUser ? `
                    <div class="comment-input-box">
                        <textarea 
                            id="comment-input-${articleId}" 
                            class="comment-textarea" 
                            placeholder="Écrivez votre commentaire..."></textarea>
                        <button 
                            class="comment-submit" 
                            id="comment-submit-${articleId}"
                            onclick="CommentsWidget.submitComment('${articleId}')">
                            <i class="fas fa-paper-plane"></i> Publier
                        </button>
                    </div>
                ` : `
                    <div class="comment-input-box">
                        <p style="text-align: center; color: var(--text-secondary);">
                            <i class="fas fa-lock"></i> 
                            Connectez-vous pour commenter
                        </p>
                    </div>
                `}
            </div>
        `;

        // Restaurer la position de scroll
        setTimeout(() => {
            if (wasScrolledToBottom) {
                // Si on était en bas, rester en bas (pour voir le nouveau commentaire)
                container.scrollTop = container.scrollHeight;
            } else {
                // Sinon restaurer la position exacte
                container.scrollTop = scrollPosition;
            }
        }, 50);
    },

    async renderComments(comments, articleId, currentUser) {
        const { supabase } = window.supabaseClient;
        let html = '';

        for (const comment of comments) {
            const author = comment.users_profile;
            const initials = `${author.prenom[0]}${author.nom[0]}`.toUpperCase();
            
            const { data: replies } = await supabase
                .from('session_reponses')
                .select(`
                    *,
                    users_profile(prenom, nom)
                `)
                .eq('session_id', comment.session_id)
                .order('date_created', { ascending: true });

            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <div class="comment-avatar">${initials}</div>
                        <span class="comment-author">${author.prenom} ${author.nom}</span>
                        <span class="comment-date">${this.formatDate(comment.date_created)}</span>
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.texte)}</div>
                    <div class="comment-actions">
                        ${currentUser ? `
                            <button class="comment-btn" onclick="CommentsWidget.toggleReplyBox('${comment.session_id}')">
                                <i class="fas fa-reply"></i> Répondre
                            </button>
                        ` : ''}
                        ${replies && replies.length > 0 ? `
                            <button class="comment-btn" onclick="CommentsWidget.toggleReplies('${comment.session_id}')">
                                <i class="fas fa-comment"></i> ${replies.length} réponse(s)
                            </button>
                        ` : ''}
                    </div>
                    
                    <div id="reply-box-${comment.session_id}" style="display: none; margin-top: 10px; padding-left: 45px;">
                        <textarea 
                            id="reply-input-${comment.session_id}" 
                            class="comment-textarea" 
                            placeholder="Écrivez votre réponse..."
                            style="min-height: 60px;"></textarea>
                        <button 
                            class="comment-submit" 
                            id="reply-submit-${comment.session_id}"
                            onclick="CommentsWidget.submitReply('${comment.session_id}')"
                            style="margin-top: 8px;">
                            <i class="fas fa-paper-plane"></i> Répondre
                        </button>
                    </div>
                    
                    ${replies && replies.length > 0 ? `
                        <div id="replies-${comment.session_id}" class="replies-container" style="display: none;">
                            ${replies.map(reply => {
                                const replyAuthor = reply.users_profile;
                                const replyInitials = `${replyAuthor.prenom[0]}${replyAuthor.nom[0]}`.toUpperCase();
                                return `
                                    <div class="reply-item">
                                        <div class="comment-header">
                                            <div class="comment-avatar" style="width: 30px; height: 30px; font-size: 12px;">${replyInitials}</div>
                                            <span class="comment-author" style="font-size: 14px;">${replyAuthor.prenom} ${replyAuthor.nom}</span>
                                            <span class="comment-date">${this.formatDate(reply.date_created)}</span>
                                        </div>
                                        <div class="comment-text" style="font-size: 14px;">${this.escapeHtml(reply.texte)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html;
    },

    async submitComment(articleId) {
        const { supabase, getCurrentUser } = window.supabaseClient;
        const input = document.getElementById(`comment-input-${articleId}`);
        const submitBtn = document.getElementById(`comment-submit-${articleId}`);
        const texte = input.value.trim();

        if (!texte) {
            alert('Veuillez écrire un commentaire');
            return;
        }

        try {
            const user = await getCurrentUser();
            if (!user) {
                alert('Vous devez être connecté pour commenter.');
                window.location.href = 'connexion.html';
                return;
            }
            
            // Désactiver le bouton et afficher un loader
            submitBtn.disabled = true;
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="comment-spinner"></div> Publication...';
            
            await supabase
                .from('sessions_commentaires')
                .insert({
                    article_id: articleId,
                    user_id: user.id,
                    texte: texte
                });

            // Vider le champ de saisie immédiatement
            input.value = '';

            // Afficher un message de succès temporaire
            this.showSuccessMessage(articleId);

            // Recharger uniquement les commentaires (la section reste ouverte)
            if (this.refreshCallback) {
                await this.refreshCallback(articleId);
            }

            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;

        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la publication du commentaire');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publier';
        }
    },

    async submitReply(sessionId) {
        const { supabase, getCurrentUser } = window.supabaseClient;
        const input = document.getElementById(`reply-input-${sessionId}`);
        const submitBtn = document.getElementById(`reply-submit-${sessionId}`);
        const texte = input.value.trim();

        if (!texte) {
            alert('Veuillez écrire une réponse');
            return;
        }

        try {
            const user = await getCurrentUser();
            if (!user) {
                alert('Vous devez être connecté pour répondre.');
                window.location.href = 'connexion.html';
                return;
            }

            // Désactiver le bouton et afficher un loader
            submitBtn.disabled = true;
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="comment-spinner"></div> Publication...';

            await supabase
                .from('session_reponses')
                .insert({
                    session_id: sessionId,
                    user_id: user.id,
                    texte: texte
                });

            // Vider le champ de saisie immédiatement
            input.value = '';

            // Afficher un message de succès
            this.showSuccessMessage(this.currentArticleId);

            // Recharger uniquement les commentaires (garde la section ouverte)
            if (this.refreshCallback && this.currentArticleId) {
                await this.refreshCallback(this.currentArticleId);
                // Rouvrir automatiquement les réponses du commentaire
                setTimeout(() => {
                    const repliesContainer = document.getElementById(`replies-${sessionId}`);
                    if (repliesContainer) {
                        repliesContainer.style.display = 'block';
                    }
                }, 100);
            }

            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;

        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la publication de la réponse');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Répondre';
        }
    },

    showSuccessMessage(articleId) {
        const widget = document.querySelector(`#comments-${articleId} .comments-widget`);
        if (!widget) return;

        // Supprimer les anciens messages
        const oldMessages = widget.querySelectorAll('.comment-success-message');
        oldMessages.forEach(msg => msg.remove());

        // Créer le message de succès
        const message = document.createElement('div');
        message.className = 'comment-success-message';
        message.innerHTML = '<i class="fas fa-check-circle"></i> Commentaire publié avec succès !';
        
        widget.insertBefore(message, widget.firstChild);

        // Supprimer après 3 secondes
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.3s';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    },

    toggleReplyBox(sessionId) {
        const box = document.getElementById(`reply-box-${sessionId}`);
        const isVisible = box.style.display !== 'none';
        
        // Fermer toutes les autres boîtes de réponse
        document.querySelectorAll('[id^="reply-box-"]').forEach(b => {
            if (b.id !== `reply-box-${sessionId}`) {
                b.style.display = 'none';
            }
        });
        
        box.style.display = isVisible ? 'none' : 'block';
        
        // Focus sur le textarea si on l'ouvre
        if (!isVisible) {
            const textarea = document.getElementById(`reply-input-${sessionId}`);
            setTimeout(() => textarea.focus(), 100);
        }
    },

    toggleReplies(sessionId) {
        const replies = document.getElementById(`replies-${sessionId}`);
        const isVisible = replies.style.display !== 'none';
        replies.style.display = isVisible ? 'none' : 'block';
        
        // Animer l'ouverture
        if (!isVisible) {
            replies.style.opacity = '0';
            replies.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                replies.style.transition = 'all 0.3s ease';
                replies.style.opacity = '1';
                replies.style.transform = 'translateY(0)';
            }, 10);
        }
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } else if (days > 0) {
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'À l\'instant';
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
