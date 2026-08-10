import { useEffect, useState } from "react"
import React from "react"
import ReactDOM from 'react-dom'

interface ModalProps {
    isOpen: boolean
    onConfirm?: () => void
    onClose: () => void
    children: React.ReactNode
    includeOk?: boolean
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, children, includeOk }) => {
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const el = document.getElementById("portal")
        setPortalRoot(el)
    }, [])

    useEffect(() => {
        if (!isOpen) return

        const handleEnterDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                if (onConfirm) {
                    onConfirm()
                    return
                }
                onClose()
            }
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        document.addEventListener('keydown', handleEnterDown)
        return () => document.removeEventListener('keydown', handleEnterDown)
    }, [isOpen, onConfirm])


    if (!isOpen || !portalRoot) return null

    return ReactDOM.createPortal(
        <div className="modal-container">
            <button onClick={onClose} className="modal-underlay" />
            <div className="modal-content">
                <button className="flex items-center close-btn" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                {children}
                {
                    includeOk &&
                    <button className="primary-btn primary-modal-btn" onClick={onClose}>
                        <p>Ok</p>
                    </button>
                }
            </div>
        </div>,
        portalRoot
    )
}

export default Modal