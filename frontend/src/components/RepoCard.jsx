function RepoCard({repo}){
    return (
        <div style={{
            border: "1px solid blue",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
        }}>
            <h3>{repo.name}</h3>
            <p>Stars:{repo.stargazers_count}</p>
            <a href={repo.html_url}
            target="_blank"
            rel="noreferrer">View repo</a>
        </div>
    );
}
export default RepoCard;