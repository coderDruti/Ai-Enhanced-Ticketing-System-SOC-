import { useState, useEffect } from 'react';

const AuditLogViewer = ({ ticketId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}/logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
                
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [ticketId]);

    if (loading) return <p className="text-sm text-gray-500">Loading audit trail...</p>;
    if (error) return <p className="text-sm text-red-500">{error}</p>;
    if (logs.length === 0) return <p className="text-sm text-gray-500">No logs found for this ticket.</p>;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">Audit Trail</h4>
            <ul className="list-none p-0 m-0">
                {logs.map((log) => (
                    <li key={log.id} className="relative border-l-2 border-blue-500 pl-4 mb-4 pb-2">
                        {/* The timeline dot */}
                        <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                        
                        <div className="text-sm text-gray-500 mb-1">
                            {new Date(log.timestamp).toLocaleString()} • <strong className="text-gray-700">{log.user ? log.user.email : 'System / AI'}</strong>
                        </div>
                        
                        <div className="font-bold text-base text-gray-900">
                            {log.action.replace(/_/g, ' ')}
                        </div>

                        {/* Render state changes if they exist */}
                        {log.newState && (
                            <pre className="bg-white p-2 rounded text-xs border border-gray-200 mt-2 text-gray-600 font-mono whitespace-pre-wrap break-words">
                                {log.previousState && <span className="block mb-1">From: {JSON.stringify(log.previousState)}</span>}
                                <span className="block">To: {JSON.stringify(log.newState)}</span>
                            </pre>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AuditLogViewer;